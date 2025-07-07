// src/types/api/auth.ts

// Coincide con LoginModel (incluyendo el campo 'app')
export interface LoginCredentials {
  user?: string | null;
  password?: string | null;
  app?: string | null;
}

// Coincide con UserModel (simplificado, añade más campos según Swagger si es necesario)
export interface User {
  id: number; // Es número en tu respuesta
  name?: string | null; // Parece ser nombre completo
  username?: string | null; // Nombre de usuario corto
  email?: string | null; // Email de login
  password?: string | null; // Probablemente siempre vacío en la respuesta
  usertype?: string | null; // Tipo de usuario (desconocido qué valores puede tener)
  nif?: string | null;
  apellido1?: string | null;
  apellido2?: string | null;
  empresa?: string | null; // Nombre de la empresa asociada (¿quizás redundante si GetEmpresa devuelve más?)
  cif?: string | null; // CIF de la empresa (¿redundante?)
  domiciliotrabajo?: string | null;
  cptrabajo?: string | null;
  localidadtrabajo?: string | null;
  telefonotrabajo?: string | null;
  provinciatrabajo?: string | null; // Parece abreviatura 'Ba'?
  domicilio?: string | null; // Domicilio personal
  cp?: string | null; // CP personal
  localidad?: string | null; // Localidad personal
  telefono?: string | null; // Teléfono personal (parece repetido con telefonotrabajo?)
  provincia?: string | null; // Código provincia personal? '28'
  emailtrabajo?: string | null; // Email de trabajo (diferente al de login?)
  conocido?: string | null; // Campo desconocido
}

 // Coincide con EmpresaModel (simplificado, añade más campos según Swagger)
export interface Company {
    id?: number; // Ajusta tipo si es string
    empresa?: string | null;
    cif?: string | null;
    direccion?: string | null;
    // ... otros campos del EmpresaModel que necesites
}

// Coincide con AuthResponse (respuesta del Login) - CORREGIDO con minúsculas
export interface LoginApiResponse {
  id?: number; // Asumiendo 'id' minúscula
  refreshToken?: string | null; // Asumiendo 'refreshToken' minúscula
  bearerToken?: string | null; // CORREGIDO a minúscula 'b'
  success: boolean; // CORREGIDO a minúscula 's'
}


// Tipos específicos usando la estructura genérica (¡MEJOR ASÍ!)


// Tipo para respuestas que solo devuelven success/message (ej. Update)
