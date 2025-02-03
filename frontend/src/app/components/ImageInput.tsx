'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from "next/navigation";

interface ImageUploadProps {
  message: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ message }) => {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      const file = event.target.files?.[0]; 

      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please select a valid image file.');
          setImagePreview(null);
          return; 
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreview(e.target.result as string);
          }
        };
        reader.readAsDataURL(file); 

        const formData = new FormData();
        formData.append('file', file);
        formData.append('time', message); 
        const start_time = performance.now()
        try {
          const response = await fetch('/api/image', {
            method: 'POST',
            body: formData,
          });


            if (response.ok){
              if (response.headers.get("Content-Type")?.includes("image/png")) {
                // If response is an image, convert it to a blob and display it
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                setProcessedImage(imageUrl);
            }
            else{
              const newreader = new FileReader();
              newreader.onload = (e) => {
                if (e.target?.result) {
                  setProcessedImage(e.target.result as string);
                }
              };
              newreader.readAsDataURL(file); 
            }
            }
            else{
              alert("Something wrong")
            }
            
        
        } catch (error) {
          console.error('Error uploading file:', error);
        }
        const stop_time = performance.now()
        setTime(((stop_time-start_time)/1000).toFixed(2).toString())
      }
    };

  const handleButtonClick = () => {
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    fileInput?.click();
  };

  return (
    <div className="mt-5">
<div className="inline-flex space-x-4">
  <button
    className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full"
    onClick={handleButtonClick}
  >
    Insert Image...
  </button>
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full"
      onClick={()=>router.push('/dashboard')}
    >
      Dashboard
    </button>

    
  </div>
  <input
        type="file"
        id="imageUpload"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <h4 className="mt-5">Time to response: {time}</h4>
      <div className="mt-6 flex justify-center gap-6">
        <div className="flex flex-col items-center">
          <h5 className="font-semibold">Input Image</h5>
          {imagePreview ? (
            <div className="max-w-[640px] max-h-[640px] overflow-hidden mt-5">
              <Image
                id="imagePreview"
                src={imagePreview}
                alt="Preview"
                width={640} // Set the desired width
                height={640} // Set the desired height
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="max-w-[640px] max-h-[640px] overflow-hidden mt-5">
              <Image
                id="imagePreview"
                src="/img/dummy.png"
                alt="Dummy Image"
                width={640}
                height={640}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <h5 className="font-semibold">Output Image</h5>
          {processedImage ? (
            <div className="max-w-[640px] max-h-[640px] overflow-hidden mt-5">
              <Image
                id="processedImage"
                src={processedImage}
                alt="Processed Image"
                width={640}
                height={640}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="max-w-[640px] max-h-[640px] overflow-hidden mt-5">
              <Image
                id="processedImage"
                src="/img/dummy.png"
                alt="Processed Image"
                width={640}
                height={640}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ImageUpload;
