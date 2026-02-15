// tests/pricingService.test.js
const PricingService = require('../services/pricingService');

describe('PricingService - Lógica Matemática de Reservas', () => {

    // ==========================================
    // 1. PREPARACIÓN DEL ESCENARIO (Setup)
    // ==========================================
    beforeAll(() => {
        // Simulamos que la caché ya cargó
        PricingService.isInitialized = true;

        // Inyectamos datos de prueba en los Maps y Arrays de tu clase
        PricingService.cache.coefficients = new Map([
            ['TURISMO', 1.00],
            ['MOTOCICLETA', 0.50],
            ['CARAVANA', 2.00]
        ]);

        PricingService.cache.extras = new Map([
            [1, 15.00],
            [8, 25.00]
        ]);

        PricingService.cache.rates = [
            { id_main_service: 1, min_days: 1, max_days: 3, daily_price: 12.00 },
            { id_main_service: 1, min_days: 4, max_days: 10, daily_price: 8.00 },
            { id_main_service: 2, min_days: 1, max_days: 3, daily_price: 15.00 }
        ];
    });

    // ==========================================
    // 2. CASOS DE PRUEBA (Test Cases)
    // ==========================================

    it('1. Debe cobrar el mínimo de 1 día si entra y sale el mismo día', () => {
        const entry_date = '2026-02-13T10:00:00';
        const exit_date = '2026-02-13T18:00:00'; 
        
        // Llamamos a tu método exacto: calculateTotalPrice
        const total = PricingService.calculateTotalPrice(entry_date, exit_date, 'TURISMO', 1, []);
        
        // 1 día * 12.00 * 1.00 = 12.00
        expect(total).toBe(12.00);
    });

    it('2. Debe calcular correctamente varios días con cambio de tramo', () => {
        const entry_date = '2026-02-01T10:00:00';
        const exit_date = '2026-02-06T10:00:00'; // 5 días exactos
        
        const total = PricingService.calculateTotalPrice(entry_date, exit_date, 'TURISMO', 1, []);
        
        // 5 días * 8.00 = 40.00
        expect(total).toBe(40.00);
    });

    it('3. Debe aplicar el multiplicador de vehículo correctamente', () => {
        const entry_date = '2026-02-01T10:00:00';
        const exit_date = '2026-02-04T10:00:00'; // 3 días
        
        const total = PricingService.calculateTotalPrice(entry_date, exit_date, 'CARAVANA', 2, []);
        
        // (3 días * 15.00) * 2.00 = 90.00
        expect(total).toBe(90.00);
    });

    it('4. Debe sumar los servicios adicionales (Extras)', () => {
        const entry_date = '2026-02-01T10:00:00';
        const exit_date = '2026-02-03T10:00:00'; // 2 días
        
        const total = PricingService.calculateTotalPrice(entry_date, exit_date, 'MOTOCICLETA', 1, [1, 8]);
        
        // Base: (2 * 12.00) * 0.50 = 12.00
        // Extras: 15.00 + 25.00 = 40.00
        // Total esperado: 52.00
        expect(total).toBe(52.00);
    });

    it('5. Programación Defensiva: Debe lanzar error si el vehículo no existe', () => {
        const entry_date = '2026-02-01T10:00:00';
        const exit_date = '2026-02-02T10:00:00';
        
        expect(() => {
            PricingService.calculateTotalPrice(entry_date, exit_date, 'OVNI', 1, []);
        }).toThrow("No se encontró un coeficiente para el tipo de vehículo OVNI");
    });

    it('6. Periodo de cortesía: NO debe cobrar día extra si se pasa por 2 horas justas (26h)', () => {
        // Entra el día 1 a las 10:00 y sale el día 2 a las 12:00 (26 horas exactas)
        const entry_date = '2026-02-01T10:00:00';
        const exit_date = '2026-02-02T12:00:00';
        
        // Esperamos que se cobre solo 1 día. (Servicio ECO: 12.00, Turismo: x1.00)
        const total = PricingService.calculateTotalPrice(entry_date, exit_date, 'TURISMO', 1, []);
        
        expect(total).toBe(12.00);
    });

    it('7. Periodo de cortesía: SÍ debe cobrar día extra si se pasa por 2 horas y 1 minuto (26h 1m)', () => {
        // Entra el día 1 a las 10:00 y sale el día 2 a las 12:01 (26 horas y 1 minuto)
        const entry_date = '2026-02-01T10:00:00';
        const exit_date = '2026-02-02T12:01:00';
        
        // Al pasarse del margen, se cobran 2 días. (Servicio ECO: 12.00 x 2 días = 24.00)
        const total = PricingService.calculateTotalPrice(entry_date, exit_date, 'TURISMO', 1, []);
        
        expect(total).toBe(24.00);
    });
});