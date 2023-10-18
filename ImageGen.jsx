import React, { useState } from "react";

const API_TOKEN = "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";

const ImageGenerationForm = () => {
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const input = event.target.elements.input.value;

    // Clear previous image outputs
    setOutputs([]);

    // Generate random numbers to create unique prompts
    const randomNumbers = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 1000)
    );

    const requests = randomNumbers.map(async (randomNumber, index) => {
      const prompt = `${input} - Image ${index + 1} - ${randomNumber}`;

      const response = await fetch(
        "https://api-inference.huggingface.co/models/prompthero/openjourney",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_TOKEN}`,
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate image");
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    });

    try {
      const imageUrls = await Promise.all(requests);
      setOutputs(imageUrls);
      // Reset the selected image index when new images are generated.
      setSelectedImageIndex(null);
    } catch (error) {
      console.error(error);
      setOutputs([]);
    }

    setLoading(false);
  };

  // Function to handle image selection for download.
  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  // Function to initiate the download of the selected image.
  const handleDownload = () => {
    if (selectedImageIndex !== null) {
      const selectedImage = outputs[selectedImageIndex];
      const a = document.createElement("a");
      a.href = selectedImage;
      a.download = `image_${selectedImageIndex + 1}.png`; // You can customize the download filename here.
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f2f2f2",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>
        Stable <span style={{ color: "#007bff" }}>Diffusion</span>
      </h1>
      <p>
      Just enter your prompt and click the generate button.
No code required to generate your image!
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="input"
          placeholder="Type your prompt here..."
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            width: "80%",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Generate
        </button>
      </form>
      <div>
        {loading && <div className="loading">Loading...</div>}
        {!loading && outputs.length > 0 && (
          <div
            className="result-images-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            {outputs.map((output, index) => (
              <div
                className={`result-image ${selectedImageIndex === index ? "selected" : ""}`}
                key={index}
                onClick={() => handleImageSelect(index)}
                style={{
                  backgroundColor: "#fff",
                  padding: "10px",
                  borderRadius: "5px",
                  boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
                  cursor: "pointer",
                }}
              >
                <img
                  src={output}
                  alt={`art-${index}`}
                  width="256"
                  height="256"
                  style={{ display: "block", margin: "0 auto" }}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedImageIndex !== null && (
        <button
          onClick={handleDownload}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Download Selected Image
        </button>
      )}
    </div>
  );
};

export default ImageGenerationForm;






