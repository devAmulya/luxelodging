import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { uploadPropertyImagesApi } from '../api/propertyApi';
import { showNotification } from '../features/notification/notificationSlice';

const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;

const checkImageResolution = (file) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    img.src = url;
  });

const ImageUploader = ({ propertyId, onUploaded }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    let lowResWarning = null;

    for (const file of files) {
      const { width, height } = await checkImageResolution(file);
      if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        lowResWarning = `"${file.name}" is only ${width}×${height}px — it may look blurry when displayed. Recommended minimum: ${MIN_WIDTH}×${MIN_HEIGHT}px.`;
      }
    }

    if (lowResWarning) {
      dispatch(showNotification({ message: lowResWarning, type: 'error' }));
    }

    setSelectedFiles(files); // warn, but don't block — host can still proceed
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('images', file));
      await uploadPropertyImagesApi(propertyId, formData);
      dispatch(showNotification({ message: 'Photos uploaded', type: 'success' }));
      setSelectedFiles([]);
      onUploaded();
    } catch (err) {
      dispatch(showNotification({ message: err.response?.data?.message || 'Upload failed', type: 'error' }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-dashed border-border rounded-lg p-4">
      <input
        type="file" multiple accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="text-sm font-sans text-ink"
      />
      <p className="text-xs text-muted font-sans mt-1">
        Recommended: at least {MIN_WIDTH}×{MIN_HEIGHT}px for a sharp display. Max 10 photos, 5MB each.
      </p>

      {selectedFiles.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="mt-3 px-4 py-2 rounded-md bg-primary text-white text-sm font-sans hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
};

export default ImageUploader;