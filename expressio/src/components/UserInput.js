import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Paper, Button } from '@mui/material';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import PlaceHolder from '../assets/placeholder.jpg';
import { styled } from '@mui/material/styles';
import axios from 'axios';

function UserInput({ setPredicted, setPredictionArr }) {
    // State variables
    const [image, setImage] = useState(null);
    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const videoRef = useRef(null);
    const imageContainerRef = useRef(null);
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

    // Styled component for hidden input
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    // UseEffect to set image dimensions
    useEffect(() => {
        if (imageContainerRef.current) {
            const { width, height } = imageContainerRef.current.getBoundingClientRect();
            setImageDimensions({ width, height });
        }
    }, []);

    // Handle Image Upload
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = imageDimensions.width;
                    canvas.height = imageDimensions.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, imageDimensions.width, imageDimensions.height);
                    const resizedImage = canvas.toDataURL('image/jpeg');
                    setImage(resizedImage);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Open Web Cam
    function handleOpenCamera() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                const videoElement = document.createElement('video');
                videoElement.srcObject = stream;
                videoElement.autoplay = true;
                videoElement.playsInline = true;

                const imageContainer = document.getElementById('image');
                imageContainer.innerHTML = '';
                imageContainer.appendChild(videoElement);

                videoRef.current = videoElement;
                setIsWebcamActive(true);
            }).catch(error => {
                console.error('Error accessing webcam:', error);
            });
    }

    // Capture Snapshot from Web Cam
    function handleCapture() {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const capturedImage = canvas.toDataURL('image/jpeg');

        const img = new Image();
        img.onload = () => {
            const resizeCanvas = document.createElement('canvas');
            resizeCanvas.width = imageDimensions.width;
            resizeCanvas.height = imageDimensions.height;
            resizeCanvas.getContext('2d').drawImage(img, 0, 0, imageDimensions.width, imageDimensions.height);
            const resizedCapturedImage = resizeCanvas.toDataURL('image/jpeg');
            setImage(resizedCapturedImage);
        };
        img.src = capturedImage;

        const imageContainer = document.getElementById('image');
        imageContainer.innerHTML = '';
        imageContainer.appendChild(img);
        setIsWebcamActive(false);

        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    function predictExpression() {
        const base64Data = image.split(',')[1];
        const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('image', blob, 'image.jpeg');

        fetch('https://expressio-backend.onrender.com/upload', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload Image');
            }
            return response.json();
        }).then(data => {
            console.log('Image Uploaded:', data);

            return axios.get('https://expressio-backend.onrender.com/predict');
        }).then(response => {
            setPredictionArr(response.data.predictionArr);
            setPredicted(response.data.prediction);
            console.log("PREDICTING ...")
        }).catch(error => {
            console.error('Error fetching prediction:', error);
        });
    }

    return (
        <div style={{ height: '100%' }} className="flex justify-around align-middle">
            <Box style={{ height: '100%' }} className="flex flex-col justify-center align-middle w-4/5">
                <Paper square elevation={0} className='py-2'>
                    <div className='text-center'>
                        <h1 className='font-bold text-2xl bg-gradient-to-r from-purple-800 to-pink-600 text-transparent bg-clip-text tracking-widest'>EXPRESSIO</h1>
                    </div>
                </Paper>
                <Paper square className='flex justify-center align-middle py-2' elevation={0}>
                    <div className='flex w-full md:w-5/6 shadow-lg h-full overflow-hidden' id='image'>
                        {image ? (
                            <img src={image} alt="Uploaded" width={imageDimensions.width} height={imageDimensions.height} />
                        ) : (
                            <img src={PlaceHolder} alt='Placeholder' ref={imageContainerRef} />
                        )}
                    </div>
                </Paper>
                <Paper square elevation={0} className='flex justify-center items-center py-2'>
                    <Grid container spacing={-5} justifyContent="center" alignItems="center" style={{ height: '100%' }}>
                        <Grid item xs={6} sm={4} className='px-1 py-2 flex justify-center'>
                            <Button component="label" role={undefined} variant="outlined" startIcon={<BackupOutlinedIcon />}>
                                Upload
                                <VisuallyHiddenInput type="file" onChange={handleImageUpload} />
                            </Button>
                        </Grid>
                        <Grid item xs={6} sm={4} className='px-1 py-2 flex justify-center'>
                            {!isWebcamActive ? (
                                <Button onClick={handleOpenCamera} color='error' variant="outlined" startIcon={<VideocamOutlinedIcon />} sx={{ backgroundColor: 'white' }}>
                                    WebCam
                                </Button>
                            ) : (
                                <Button onClick={handleCapture} color='error' variant="outlined" startIcon={<BackupOutlinedIcon />}>
                                    Capture
                                </Button>
                            )}
                        </Grid>
                        <Grid item xs={6} sm={4} className='px-1 py-2 flex justify-center'>
                            <Button variant="outlined" color='secondary' onClick={predictExpression} endIcon={<ArrowCircleRightOutlinedIcon />}>
                                Predict
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>
        </div>
    );
}

export default UserInput;
