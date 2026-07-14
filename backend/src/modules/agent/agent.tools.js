const { searchAllProperties, getProperty } = require('../property/property.service');
const { checkAvailability } = require('../booking/booking.service');

const isValidDate = (str) =>
  typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime());

const toolDeclarations = [
  {
    type: 'function',
    name: 'search_properties',
    description: 'Search available rental properties by city, price range, guest count, or dates. Returns matching properties with id, title, city, price per night, and guest capacity.',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City to search in, e.g. Goa' },
        minPrice: { type: 'number', description: 'Minimum price per night in INR' },
        maxPrice: { type: 'number', description: 'Maximum price per night in INR' },
        guests: { type: 'number', description: 'Minimum guest capacity required' },
        checkIn: { type: 'string', description: 'Check-in date, YYYY-MM-DD' },
        checkOut: { type: 'string', description: 'Check-out date, YYYY-MM-DD' },
      },
      required: [],
    },
  },
  {
    type: 'function',
    name: 'check_availability',
    description: 'Check whether a specific property is available for given dates. Requires a propertyId obtained from search_properties first.',
    parameters: {
      type: 'object',
      properties: {
        propertyId: { type: 'number', description: 'The property ID to check' },
        checkIn: { type: 'string', description: 'Check-in date, YYYY-MM-DD' },
        checkOut: { type: 'string', description: 'Check-out date, YYYY-MM-DD' },
      },
      required: ['propertyId', 'checkIn', 'checkOut'],
    },
  },
  {
    type: 'function',
    name: 'propose_booking',
    description: 'Calculate a price quote (nights, total cost) for a property and date range so the user can review it. This does NOT create a real booking or take payment — the user must confirm through the app.',
    parameters: {
      type: 'object',
      properties: {
        propertyId: { type: 'number', description: 'The property ID to book' },
        checkIn: { type: 'string', description: 'Check-in date, YYYY-MM-DD' },
        checkOut: { type: 'string', description: 'Check-out date, YYYY-MM-DD' },
        numberOfGuests: { type: 'number', description: 'Number of guests' },
      },
      required: ['propertyId', 'checkIn', 'checkOut', 'numberOfGuests'],
    },
  },
];

const executeTool = async (name, args) => {
  switch (name) {
    case 'search_properties': {
      const filters = {
        city: typeof args.city === 'string' ? args.city : undefined,
        minPrice: Number.isFinite(Number(args.minPrice)) ? args.minPrice : undefined,
        maxPrice: Number.isFinite(Number(args.maxPrice)) ? args.maxPrice : undefined,
        guests: Number.isFinite(Number(args.guests)) ? args.guests : undefined,
        checkIn: isValidDate(args.checkIn) ? args.checkIn : undefined,
        checkOut: isValidDate(args.checkOut) ? args.checkOut : undefined,
      };

      const { results } = await searchAllProperties(filters);
      return results.slice(0, 8).map((p) => ({
        id: p.id,
        title: p.title,
        city: p.city,
        country: p.country,
        pricePerNight: p.price_per_night,
        guestsAllowed: p.guests_allowed,
      }));
    }

    case 'check_availability': {
      if (!Number.isFinite(Number(args.propertyId))) {
        throw new Error('propertyId must be a valid number');
      }
      if (!isValidDate(args.checkIn) || !isValidDate(args.checkOut)) {
        throw new Error('Dates must be in YYYY-MM-DD format');
      }
      try {
        return await checkAvailability(args.propertyId, args.checkIn, args.checkOut);
      } catch (err) {
        // Business rejections (past date, bad range, missing property) are a
        // normal answer the model should relay — not a hard failure
        return { available: false, message: err.message };
      }
    }

    case 'propose_booking': {
      if (!Number.isFinite(Number(args.propertyId))) {
        throw new Error('propertyId must be a valid number');
      }
      if (!isValidDate(args.checkIn) || !isValidDate(args.checkOut)) {
        throw new Error('Dates must be in YYYY-MM-DD format');
      }
      const guests = Number(args.numberOfGuests);
      if (!Number.isInteger(guests) || guests < 1) {
        throw new Error('numberOfGuests must be a positive whole number');
      }

      const property = await getProperty(args.propertyId).catch(() => null);
      if (!property) {
        return { available: false, message: 'That property could not be found.' };
      }

      if (guests > property.guests_allowed) {
        return {
          available: false,
          message: `This property only allows up to ${property.guests_allowed} guests.`,
        };
      }

      let availability;
      try {
        availability = await checkAvailability(args.propertyId, args.checkIn, args.checkOut);
      } catch (err) {
        return { available: false, message: err.message };
      }

      if (!availability.available) {
        return { available: false, message: 'These dates are not available for this property.' };
      }

      const nights = (new Date(args.checkOut) - new Date(args.checkIn)) / (1000 * 60 * 60 * 24);
      const totalPrice = nights * property.price_per_night;

      return {
        available: true,
        propertyId: property.id,
        propertyTitle: property.title,
        city: property.city,
        pricePerNight: property.price_per_night,
        nights,
        totalPrice,
        checkIn: args.checkIn,
        checkOut: args.checkOut,
        numberOfGuests: guests,
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
};

module.exports = { toolDeclarations, executeTool };