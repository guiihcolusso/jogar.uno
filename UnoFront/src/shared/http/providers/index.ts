// Apenas o `clientHttp` é re-exportado aqui — `serverHttp` permanece em
// path explícito para evitar arrastar `'server-only'` para o bundle do client.
export { clientHttp } from './client.provider'
