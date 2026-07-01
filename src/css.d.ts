// Declaraciones para imports de CSS (usados por los archivos web del template).
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
