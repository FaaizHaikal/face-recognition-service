import { useContext, useEffect } from 'react';
import AdminContext from '../context/AdminContext';
import AppContext from '../context/AppContext';
import LoggerContext from '../context/LoggerContext';
import { styled } from '@mui/material/styles';
import { Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { Button } from '@mui/material';
import { Typography } from '@mui/material';
import { Box } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import base64ToBlob from '../utils/Base64ToBlob';

function AdminAddCustomer() {
  const { adminAction, setAdminAction } = useContext(AdminContext);

  const {
    COMPRE_API_KEY,
    COMPRE_HOST,
    COMPRE_PORT,
    SERVER_HOST,
    SERVER_PORT,
    capturedImage,
    setCapturedImage,
    setIsPhotoTaken,
    isPhotoTaken,
    isFormValid,
    setIsFormValid,
    formData,
    setFormData,
  } = useContext(AppContext);

  const { showLog } = useContext(LoggerContext);

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

  const isNomorAntrianValid = () => {
    return formData.nomorAntrian.length > 0;
  };

  const handleFormChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  useEffect(() => {
    const isNamaValid = formData.nama.length > 0;

    setIsFormValid(isNamaValid && isNomorAntrianValid());
  }, [formData, setIsFormValid]);

  const insertOneDatabase = async (id) => {
    const requestBody = {
      id: id,
      nama: formData.nama,
      nomorAntrian: formData.nomorAntrian,
    }
    const request = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(
      `http://${SERVER_HOST}:${SERVER_PORT}/api/add-customer`,
      request
    );

    return response;
  };

  const insertOneCompreFace = async (id) => {
    const imageBlob = base64ToBlob(capturedImage, 'image/jpeg');

    const request = new FormData();
    request.append('file', imageBlob, 'image.jpeg');

    const response = await fetch(
      `http://${COMPRE_HOST}:${COMPRE_PORT}/api/v1/recognition/faces?subject=${id}`,
      {
        method: 'POST',
        headers: {
          'x-api-key': COMPRE_API_KEY,
        },
        body: request,
      }
    );

    return response;
  };

  const handleClickedYes = async () => {
    const newId = Date.now().toString();

    try {
      const response = await insertOneCompreFace(newId);

      if (!response.ok) {
        console.error('Invalid Response:', response);

        setCapturedImage(null);
        setIsPhotoTaken(false);

        showLog('Face is not detected', 'error');

        return;
      }
    } catch (error) {
      console.error(error);
      showLog('Face is not detected', 'error');

      return;
    }

    try {
      const response = await insertOneDatabase(newId);

      if (!response.ok) {
        console.error('Invalid Response:', response);

        setCapturedImage(null);
        setIsPhotoTaken(false);

        showLog('Face not detected', 'error');

        return;
      }
    } catch (error) {
      console.error('Error:', error);
      showLog('Failed to submit form', 'error');

      return;
    }
    
    showLog('Form submitted successfully', 'success');

    setCapturedImage(null);
    setIsPhotoTaken(false);
    setFormData({
      nama: '',
      nomorAntrian: '',
    });

    setAdminAction('');

    window.location.reload();
  };

  const handleClickedNo = () => {
    setCapturedImage(null);
    setIsPhotoTaken(false);
    setFormData({
      nama: '',
      nomorAntrian: '',
    });

    setAdminAction('');
  };

  return (
    <Dialog open={adminAction === 'add'}>
      <DialogContent>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
            {`Tambah Pelanggan Baru`}
          </Typography>
          <TextField
            fullWidth
            label="Nama Lengkap"
            margin="normal"
            name="nama"
            onChange={handleFormChange}
            required
            value={formData.nama}
          />
          <TextField
            fullWidth
            label="No. Antrian"
            margin="normal"
            name="nomorAntrian"
            error={!isNomorAntrianValid() && formData.nomorAntrian.length > 0}
            helperText={
              !isNomorAntrianValid() && formData.nomorAntrian.length > 0
                ? 'Nomor antrian tidak valid'
                : ''
            }
            onChange={handleFormChange}
            required
            value={formData.nomorAntrian}
          />

          {/* Image Input */}
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'left',
              mt: 2,
            }}
          >
            {capturedImage && (
              <img
                alt="Captured"
                src={capturedImage}
                style={{
                  borderRadius: 8,
                  maxHeight: 200,
                  marginRight: 16,
                  maxWidth: 200,
                }}
              />
            )}
            <Button
              color="primary"
              component="label"
              startIcon={<AddPhotoAlternateIcon />}
              variant="contained"
              sx={{
                mt: 2,
              }}
            >
              {`Unggah Foto`}
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files[0];

                  if (file) {
                    const reader = new FileReader();

                    reader.onload = (event) => {
                      setCapturedImage(event.target.result);
                    };

                    reader.readAsDataURL(file);

                    setIsPhotoTaken(true);
                  }
                }}
                multiple
              />
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          autoFocus
          onClick={() => handleClickedNo()}
          color="error"
          sx={{ fontWeight: 900 }}
        >
          {`Batal`}
        </Button>
        <Button
          onClick={() => handleClickedYes()}
          autoFocus
          color="success"
          sx={{ fontWeight: 900 }}
          disabled={!isFormValid || !isPhotoTaken}
        >
          {`Tambah`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AdminAddCustomer;
