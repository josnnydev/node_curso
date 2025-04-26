import bcrypt from 'bcrypt'

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  return hash
}

const comparePassword = async (enteredPassword: string, storedPasswordHash: string): Promise<boolean> => {
  const isMatch = await bcrypt.compare(enteredPassword, storedPasswordHash)
  return isMatch
}

// Generar un hash de ejemplo
(async () => {
  const password = '123456'
  const hash = await hashPassword(password)
  console.log('Hash generado:', hash)


// Verificar la comparación

  const isValid = await comparePassword('123456', hash)
  console.log('¿La contraseña coincide?', isValid)  // Debería devolver "true"
})()

