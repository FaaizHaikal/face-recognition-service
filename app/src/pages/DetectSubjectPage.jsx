import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AppContext from '../context/AppContext';
import Camera from '../components/Camera';
import { Box, Button, Typography } from '@mui/material';
import base64ToBlob from '../utils/Base64ToBlob';
import cropImageWithOvalShape from '../utils/CropImageWithOvalShape';
import Progress from '../components/Progress';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';

function DetectSubjectPage() {
  const {
    apiKey,
    scoreThreshold,
    cameraRef,
    cameraWidth,
    faceWidth,
    faceHeight,
    isPhotoTaken,
    setIsPhotoTaken,
    capturedImage,
    setCapturedImage,
    formData,
    setFormData,
  } = useContext(AppContext);

  const maxDetectedFaceSec = 4;
  const [detectedFaceSec, setDetectedFaceSec] = useState(0);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isFaceRecognized, setIsFaceRecognized] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const navigate = useNavigate();

  const detectedFaceIsValid = (box) => {
    const area = (box.x_max - box.x_min) * (box.y_max - box.y_min);
    return box.probability > scoreThreshold && area > 4500;
  };

  const updateDetectedSubject = (data) => {
    const result = data.result[0];
    if (detectedFaceIsValid(result.box)) {
      if (detectedFaceSec > maxDetectedFaceSec) {
        setIsFaceDetected(true);
        console.log(result.subjects);
        if (result.subjects.length > 0 && result.subjects[0].similarity > scoreThreshold) {
          const [nik, nama] = result.subjects[0].subject.split('_');
          setFormData((prev) => ({
            ...prev,
            nik,
            nama,
          }));

          setDetectedFaceSec(0);
          setIsFaceRecognized(true);
        } else {
          setIsFaceRecognized(false);
        }
      } else {
        setDetectedFaceSec((prev) => prev + 1);
      }
    } else {
      setDetectedFaceSec(0);
      setIsFaceDetected(false);
    }
  };

  const requestFaceRecognition = async () => {
    const image = new Image();
    image.src = cameraRef.current.getScreenshot();

    image.onload = () => {
      const imageBlob = base64ToBlob(
        cropImageWithOvalShape(image, faceWidth, faceHeight),
        'image/jpeg'
      );

      const request = new FormData();
      request.append('file', imageBlob, 'image.jpeg');

      fetch(
        `http://localhost:8000/api/v1/recognition/recognize?&limit=1&det_prob_threshold=${scoreThreshold}`,
        {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
          },
          body: request,
        }
      )
        .then((response) => {
          if (response.ok) {
            response.json().then((data) => {
              updateDetectedSubject(data);
            });
          } else {
            setDetectedFaceSec(0);
            setIsFaceDetected(false);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          setDetectedFaceSec(0);
          setIsFaceDetected(false);
        });
    };
  };

  const captureImage = () => {
    const image = new Image();
    image.src = cameraRef.current.getScreenshot();

    image.onload = () => {
      setCapturedImage(cropImageWithOvalShape(image, faceWidth, faceHeight));
      setIsPhotoTaken(true);
    };
  };

  const handleClick = (resetData) => () => {
    if (resetData) {
      setFormData((prev) => ({
        ...prev,
        nik: '',
        nama: '',
      }));
    }

    navigate('/form');
  };

  useEffect(() => {
    if (isFaceDetected) {
      if (isPhotoTaken) {
        return;
      }

      captureImage();
      return;
    }

    const interval = setInterval(() => {
      requestFaceRecognition();
    }, 500);

    return () => {
      clearInterval(interval);
    };
  });

  return (
    <Box width={cameraWidth}>
      {isPhotoTaken ? (
        <img src={capturedImage} style={{ borderRadius: 30 }} />
      ) : (
        <Camera />
      )}
      <Progress value={detectedFaceSec * (100 / maxDetectedFaceSec)} />
      <Dialog
        fullScreen={fullScreen}
        open={isFaceDetected}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogContent>
          <DialogContentText>
            {isFaceRecognized ? (
              <p>
                Selamat datang! Apakah Anda <strong>{formData.nama}</strong>?
              </p>
            ) : (
              <p>Wajah Anda tidak dikenali. Harap mengisi data selanjutnya.</p>
            )}
          </DialogContentText>
        </DialogContent>
        {isFaceRecognized ? (
          <DialogActions>
            <Button
              autoFocus
              onClick={handleClick(true)}
              color="error"
              sx={{ fontWeight: 900 }}
            >
              {`Tidak`}
            </Button>
            <Button
              onClick={handleClick(false)}
              autoFocus
              color="success"
              sx={{ fontWeight: 900 }}
            >
              {`Ya`}
            </Button>
          </DialogActions>
        ) : (
          <DialogActions>
            <Button
              autoFocus
              onClick={handleClick(true)}
              sx={{ fontWeight: 900 }}
            >
              {`Lanjutkan`}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
}

export default DetectSubjectPage;