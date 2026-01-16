🚗 PaparcApp es la aplicación web para gestionar reservas y la operativa diaria de empresas de aparcacoches, actualmente en versión beta con foco en la parte visual y de acceso de usuarios. 📱✨ En esta fase no hay todavía lógica de negocio completa ni base de datos operativa.
​

📋 Descripción del proyecto
Aplicación web para empresas de parking valet (recogida del coche en terminal o punto de encuentro y traslado a las instalaciones de la empresa). 🏢🚙
​

Objetivo: integrar reservas, comunicación con el cliente y panel de trabajo para empleados en una única herramienta. 📧📊
​

Estado actual: prototipo navegable con páginas principales y estructura preparada para conectar con el backend y la base de datos. ✅
​

🎯 Funcionalidades beta disponibles
Página inicial con explicación del servicio, acceso a login/registro y navegación básica hacia el área de clientes y trabajadores. 🏠
​

Dashboard inicial de trabajador con estructura para mostrar entradas, salidas y métricas del día (aún con datos simulados/no persistentes). 📈
​

Páginas de autenticación: login y registro de usuario, con formularios y validaciones básicas en el frontal. 🔐
​

Página de privacidad y aviso legal para informar del tratamiento de datos de clientes y reservas. 🛡️
​

🚀 Funcionalidades planificadas (no implementadas aún)
Motor de reservas completo: creación, modificación y cancelación de reservas desde web y por parte del trabajador, con cálculo automático de precio según días, tipo de servicio y vehículo. 💰
​

Gestión operativa: confirmación de entrada y salida de vehículos, toma de fotografías obligatorias, impresión de tickets y generación de resguardos. 📸🖨️
​

Notificaciones y recordatorios: emails y mensajes automáticos (y futuro chatbot) para confirmaciones, recordatorios 24h antes y resúmenes del servicio. ⏰
​

🗄️ Estado de la base de datos y backend
Modelo de datos definido (clientes, vehículos, tarifas, reservas, fotos, eventos de reserva, etc.), pendiente de conexión real con la interfaz.
​

Endpoints y lógica de negocio en diseño: cálculo de precios, control de estados de reserva, reglas de modificación/cancelación y tareas programadas para recordatorios. 🔧
​

En esta beta no se almacena información real; los formularios y vistas funcionan a nivel de interfaz sin persistencia definitiva. ⚠️
​

⚙️ Tecnologías y enfoque de desarrollo
Arquitectura pensada en separación frontend–backend, con API REST para comunicación con la base de datos y servicios futuros (chatbot, exportaciones, etc.). 🌐
​

Desarrollo orientado a un MVP incremental: primero flujo web y panel de trabajo básicos, después integración con base de datos, precios, fotos y automatizaciones. 📱➡️☁️
​

Documentación funcional basada en casos de uso e historias de usuario (clientes y trabajadores) para guiar la implementación técnica. 📚
