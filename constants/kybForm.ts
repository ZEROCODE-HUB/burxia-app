// Configuración del formulario KYB (vinculación persona jurídica), fiel al
// formulario de Google que usaba el cliente. Se renderiza desde acá para no
// hardcodear 30 inputs en la pantalla. Las respuestas se guardan en un objeto
// plano cuyas keys son los `id` de cada campo (van al jsonb `answers`).

export type KybFieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'choice' | 'date';

export interface KybField {
  id: string;
  label: string;
  type: KybFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  hint?: string;
}

export interface KybSection {
  title: string;
  subtitle?: string;
  fields: KybField[];
}

const SI_NO = ['Sí', 'No'];

export const KYB_SECTIONS: KybSection[] = [
  {
    title: 'Solicitud',
    fields: [
      { id: 'tipo_solicitud', label: 'Tipo de solicitud', type: 'choice', required: true, options: ['Nueva solicitud', 'Actualización'] },
      { id: 'tipo_servicio', label: 'Tipo de servicio', type: 'choice', required: true, options: ['Pagos y recaudos', 'Cambio asistido', 'Cross Border Payment'] },
      { id: 'volumen', label: 'Volumen mensual de transacciones (COP)', type: 'choice', required: true, options: ['Menos de 300.000.000', 'Entre 300.000.000 y 600.000.000', 'Entre 600.000.000 y 1.000.000.000', 'Más de 1.000.000.000'] },
    ],
  },
  {
    title: 'Información de la persona jurídica',
    fields: [
      { id: 'razon_social', label: 'Nombre / Razón social', type: 'text', required: true },
      { id: 'nit', label: 'NIT', type: 'text', required: true },
      { id: 'telefono', label: 'Número de teléfono', type: 'phone', required: true },
      { id: 'direccion', label: 'Dirección', type: 'text', required: true },
      { id: 'ciudad_pais', label: 'Ciudad / País', type: 'text', required: true },
    ],
  },
  {
    title: 'Representante legal',
    fields: [
      { id: 'rl_nombre', label: 'Nombre completo', type: 'text', required: true },
      { id: 'rl_tipo_doc', label: 'Tipo de documento', type: 'choice', required: true, options: ['Cédula de ciudadanía', 'Cédula de extranjería', 'Pasaporte', 'Otro'] },
      { id: 'rl_num_doc', label: 'Número de documento', type: 'text', required: true },
      { id: 'rl_fecha_expedicion', label: 'Fecha de expedición', type: 'date', required: true },
      { id: 'rl_fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date', required: true },
      { id: 'rl_pais_ciudad_nac', label: 'País y ciudad de nacimiento', type: 'text', required: true },
      { id: 'pep_recursos_publicos', label: '¿Por su cargo maneja recursos públicos?', type: 'choice', required: true, options: SI_NO },
      { id: 'pep_poder_publico', label: '¿Por su cargo o actividad ejerce algún grado de poder público?', type: 'choice', required: true, options: SI_NO },
      { id: 'pep_reconocimiento', label: '¿Por su actividad u oficio goza de reconocimiento público?', type: 'choice', required: true, options: SI_NO },
      { id: 'pep_vinculo_pep', label: '¿Existe algún vínculo entre usted y una persona expuesta públicamente?', type: 'choice', required: true, options: SI_NO },
      { id: 'pep_obligaciones_tributarias', label: '¿Es sujeto de obligaciones tributarias en otro país o grupo de países?', type: 'choice', required: true, options: SI_NO },
      { id: 'beneficiarios_finales', label: 'Beneficiarios finales (socios/accionistas con participación directa o indirecta > 5%)', type: 'textarea', required: true },
    ],
  },
  {
    title: 'Información financiera',
    fields: [
      { id: 'actividad_economica', label: 'Actividad económica / comercial', type: 'textarea', required: true },
      { id: 'codigos_ciiu', label: 'Códigos CIIU', type: 'text', required: true },
      { id: 'ingresos_mensuales', label: 'Ingresos mensuales', type: 'text', required: true },
      { id: 'activos_totales', label: 'Activos totales', type: 'text', required: true },
      { id: 'pasivos_totales', label: 'Pasivos totales', type: 'text', required: true },
      { id: 'patrimonio', label: 'Patrimonio', type: 'text', required: true },
      { id: 'origen_fondos', label: 'Declaración de origen de fondos y/o bienes', type: 'choice', required: true, options: ['Desarrollo objeto social', 'Aporte de socios', 'Utilidades', 'Otros'] },
    ],
  },
  {
    title: 'Declaraciones',
    subtitle: 'Autorizaciones legales requeridas',
    fields: [
      { id: 'decl_antilavado', label: 'Declaro que ni yo, ni la persona jurídica que represento, ni sus socios/representantes, nos encontramos investigados ni condenados por narcotráfico, lavado de activos, financiación del terrorismo o corrupción.', type: 'choice', required: true, options: ['Autorizo', 'No autorizo'] },
      { id: 'decl_habeas_data', label: 'Autorizo a BURXIA S.A.S (o a quien designe) a consultar, verificar y tratar mis datos conforme a la Ley 1581 de 2012 y normas concordantes.', type: 'choice', required: true, options: ['Autorizo', 'No autorizo'] },
    ],
  },
];

export interface KybDocType {
  id: string;
  label: string;
  required?: boolean;
}

// Anexo documental (PDF). El `id` es el doc_type que se guarda en kyb_documents.
export const KYB_DOCUMENTS: KybDocType[] = [
  { id: 'doc_id_rl', label: 'Documento de identidad del Representante Legal', required: true },
  { id: 'doc_id_socios', label: 'Documento de identidad de los Socios (si aplica)' },
  { id: 'cert_existencia', label: 'Certificado de Existencia y Representación Legal (< 30 días)', required: true },
  { id: 'estados_financieros', label: 'Estados Financieros al corte más reciente con Notas', required: true },
  { id: 'renta_sociedad', label: 'Últimas dos Declaraciones de Renta de la sociedad', required: true },
  { id: 'renta_socios', label: 'Últimas dos Declaraciones de Renta de los socios', required: true },
  { id: 'composicion_accionaria', label: 'Certificación de composición accionaria (< 30 días)', required: true },
  { id: 'contador', label: 'Cédula y tarjeta profesional del contador', required: true },
  { id: 'cert_bancaria', label: 'Certificación Bancaria Vigente', required: true },
  { id: 'rut', label: 'Copia RUT actualizado', required: true },
  { id: 'rub', label: 'Copia RUB (Registro de beneficiarios finales)', required: true },
  { id: 'decl_origen_fondos', label: 'Declaración Juramentada de Origen de Fondos', required: true },
  { id: 'extractos_sociedad', label: 'Extractos Bancarios últimos 6 meses de la sociedad', required: true },
];

// Campos denormalizados que la RPC submit_kyb lee del objeto answers.
export const KYB_KEY_FIELDS = ['razon_social', 'nit', 'tipo_servicio', 'volumen'] as const;
