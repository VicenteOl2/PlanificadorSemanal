import React, { useState } from 'react';
import {
  Box,
  Input,
  Button,
  Heading,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Registro: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth);
      setSuccessMsg('✅ Cuenta creada con éxito. Inicia sesión desde el menú principal.');
      setEmail('');
      setPassword('');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('⚠️ Ya estás registrado. Inicia sesión desde el menú principal.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('⚠️ La contraseña debe tener al menos 6 caracteres.');
      } else {
        setErrorMsg('❌ Ocurrió un error inesperado al registrarse.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box mt={20} textAlign="center">
        <Spinner size="xl" color="teal.500" />
        <Text mt={4}>Procesando registro...</Text>
      </Box>
    );
  }

  return (
    <Box maxW="400px" mx="auto" mt={10} p={6} boxShadow="md" borderRadius="md">
      <Heading mb={6} size="md" textAlign="center">
        Registro de usuario
      </Heading>
      <form onSubmit={handleRegistro}>
        <VStack spacing={4}>
          <Input
            placeholder="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
          />
          <Input
            placeholder="Contraseña (mín. 6 caracteres)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isRequired
          />
          <Button
            type="submit"
            colorScheme="teal"
            width="100%"
            isDisabled={loading}
          >
            Registrarse
          </Button>

          {errorMsg && (
            <Alert status="error" fontSize="sm">
              <AlertIcon />
              {errorMsg}
            </Alert>
          )}

          {successMsg && (
            <Alert status="success" fontSize="sm">
              <AlertIcon />
              {successMsg}
            </Alert>
          )}
        </VStack>
      </form>
    </Box>
  );
};

export default Registro;