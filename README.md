# 🚗 PaparcApp (Beta)

**PaparcApp** es una aplicación web diseñada para la gestión integral de reservas y la operativa diaria de empresas de **aparcacoches (Valet Parking)**. 

Actualmente, el proyecto se encuentra en **fase beta**, con un enfoque principal en la arquitectura visual, la navegación y el acceso de usuarios.

---

## 📋 Descripción del Proyecto
La aplicación está orientada a optimizar el flujo de trabajo de empresas de parking valet (recogida del coche en terminal o punto de encuentro y traslado a las instalaciones).

* **Objetivo:** Integrar reservas, comunicación con el cliente y panel de trabajo para empleados en una única herramienta centralizada. 📧📊
* **Estado actual:** Prototipo navegable con las páginas principales y estructura preparada para conectar con el backend y la base de datos. ✅

---

## 🎯 Funcionalidades Beta Disponibles
* 🏠 **Página Inicial:** Explicación del servicio y navegación hacia las áreas de clientes y trabajadores.
* 📈 **Dashboard del Trabajador:** Estructura para mostrar entradas, salidas y métricas del día (con datos simulados/no persistentes).
* 🔐 **Autenticación:** Páginas de login y registro con formularios y validaciones básicas en el frontend.
* 🛡️ **Legal:** Páginas de privacidad y aviso legal para el tratamiento de datos.

---

## 🚀 Funcionalidades Planificadas (Roadmap)
* **Motor de reservas completo:** Creación, modificación y cancelación con cálculo automático de precios según días y tipo de vehículo. 💰
* **Gestión operativa:** Confirmación de entrada/salida, toma de fotografías obligatorias e impresión de tickets. 📸🖨️
* **Notificaciones:** Emails automáticos y recordatorios 24h antes del servicio. ⏰

---

## 🗄️ Estado del Backend y Base de Datos
> [!WARNING]
> **Nota importante:** En esta fase beta no se almacena información real. Los formularios funcionan a nivel de interfaz sin persistencia definitiva. ⚠️

* **Modelo de datos definido:** Clientes, vehículos, tarifas, reservas, fotos y eventos de reserva.
* **Lógica en diseño:** Pendiente la conexión real con la interfaz para el cálculo de precios y control de estados de reserva. 🔧

---

## ⚙️ Tecnologías y Enfoque
* **Arquitectura:** Separación Frontend–Backend mediante **API REST**. 🌐
* **Estrategia:** Desarrollo orientado a un **MVP incremental** (primero flujo visual, luego integración de datos y automatizaciones).
* **Documentación:** Basada en casos de uso e historias de usuario para guiar la implementación técnica. 📚

---

## 🛠️ Próximos Pasos
- [ ] Implementación de base de datos operativa.
- [ ] Conexión de endpoints para persistencia de usuarios.
- [ ] Desarrollo del motor de cálculo de tarifas.
- [ ] Integración de sistema de carga de imágenes.
