import { Box } from '@mui/material';
import { Button } from '@mui/material';
import { Card } from '@mui/material';
import { FormControl, FormLabel } from '@mui/material';
import { Typography } from '@mui/material';
import { TextField } from '@mui/material';

function LoginPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;

    console.log(username, password);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Card
        sx={{
          padding: 5,
          borderRadius: 2,
          boxShadow: 2,
          width: 300,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            marginBottom: 2,
          }}
        >
          Admin Login
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField id="username" />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField id="password" type="password" />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
            >
              Login
            </Button>
          </FormControl>
        </Box>
      </Card>
    </Box>
  );
}
export default LoginPage;
