class NuclearReactor {
    constructor() {
        // Estado físico del reactor
        this.temperature = 350;
        this.pressure = 155;
        this.coolantLevel = 85;
        this.controlRods = 70;
        this.coolingSpeed = 50;
        this.coolantFlow = 75;
        this.powerOutput = 750;
        
        // Sistema de daño
        this.damage = 0;
        this.maxDamage = 100;
        
        // Sistema de niveles
        this.currentLevel = 1;
        this.levelTarget = 1000;
        this.totalPowerGenerated = 0;
        this.levelComplete = false;
        
        // Estado del sistema
        this.isOperating = true;
        this.isPaused = false;
        this.dataHistory = [];
        
        // Control de alertas únicas
        this.hasShownEmptyAlert = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startSimulation();
        this.setupChart();
    }
    
    initializeElements() {
        this.elements = {
            tempDisplay: document.getElementById('tempDisplay'),
            pressureBar: document.getElementById('pressureBar'),
            coolantBar: document.getElementById('coolantBar'),
            powerBar: document.getElementById('powerBar'),
            powerValue: document.getElementById('powerValue'),
            rodValue: document.getElementById('rodValue'),
            coolingValue: document.getElementById('coolingValue'),
            flowValue: document.getElementById('flowValue'),
            reactorState: document.getElementById('reactorState'),
            coolantState: document.getElementById('coolantState'),
            reactorStatus: document.getElementById('reactorStatus'),
            coolantStatus: document.getElementById('coolantStatus'),
            criticalAlert: document.getElementById('criticalAlert'),
            warningAlert: document.getElementById('warningAlert'),
            reactorCore: document.getElementById('reactorCore'),
            rod1: document.getElementById('rod1'),
            rod2: document.getElementById('rod2'),
            rod3: document.getElementById('rod3'),
            damageBar: document.getElementById('damageBar'),
            damageValue: document.getElementById('damageValue'),
            levelDisplay: document.getElementById('levelDisplay'),
            targetDisplay: document.getElementById('targetDisplay'),
            progressDisplay: document.getElementById('progressDisplay'),
            nextLevelBtn: document.getElementById('nextLevelBtn'),
            currentLevelBadge: document.getElementById('currentLevelBadge'),
            explosionDiv: null
        };
    }
    
    setupEventListeners() {
        document.getElementById('controlRods').addEventListener('input', (e) => {
            this.controlRods = parseInt(e.target.value);
            this.elements.rodValue.textContent = this.controlRods + '%';
            this.updateControlRods();
        });
        
        document.getElementById('coolingSpeed').addEventListener('input', (e) => {
            this.coolingSpeed = parseInt(e.target.value);
            this.elements.coolingValue.textContent = this.coolingSpeed + '%';
        });
        
        document.getElementById('coolantFlow').addEventListener('input', (e) => {
            this.coolantFlow = parseInt(e.target.value);
            this.elements.flowValue.textContent = this.coolantFlow + '%';
        });
        
        document.getElementById('scramButton').addEventListener('click', () => {
            this.emergencyScram();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        // Botón de pausa
        if (document.getElementById('pauseBtn')) {
            document.getElementById('pauseBtn').addEventListener('click', () => {
                this.togglePause();
            });
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.innerHTML = this.isPaused ? 
                '<i class="fas fa-play"></i> Reanudar' : 
                '<i class="fas fa-pause"></i> Pausar';
        }
        
        if (this.isPaused) {
            this.elements.reactorState.textContent = 'PAUSADO';
            this.elements.reactorStatus.className = 'status-indicator status-warning';
        } else {
            this.elements.reactorState.textContent = 'Normal';
            this.elements.reactorStatus.className = 'status-indicator status-normal';
        }
    }
    
    updateControlRods() {
        const insertion = this.controlRods;
        const translateY = `translateY(${insertion - 100}%)`;
        
        this.elements.rod1.style.transform = translateY;
        this.elements.rod2.style.transform = translateY;
        this.elements.rod3.style.transform = translateY;
    }
    
    calculateReactorPhysics() {
        if (this.isPaused) return;
        
        const reactivityFactor = (100 - this.controlRods) / 100;
        const heatGenerated = reactivityFactor * 1000;
        const coolingEffect = (this.coolantFlow * this.coolingSpeed) / 10000 * 800;
        
        const netHeat = heatGenerated - coolingEffect;
        this.temperature = Math.max(200, Math.min(600, this.temperature + netHeat * 0.1));
        
        // SISTEMA DE DAÑO
        const safeMinTemp = 200;
        const safeMaxTemp = 400;
        
        let tempDamageRate = 0;
        
        if (this.temperature > safeMaxTemp) {
            const excessTemp = this.temperature - safeMaxTemp;
            tempDamageRate = excessTemp * 0.15;
        } else if (this.temperature < safeMinTemp) {
            const deficitTemp = safeMinTemp - this.temperature;
            tempDamageRate = deficitTemp * 0.05;
        }
        
        this.damage = Math.max(0, Math.min(this.maxDamage, this.damage + tempDamageRate));
        
        this.pressure = 100 + (this.temperature - 200) * 0.5;
        
        // REFRIGERANTE CONSUMO 200% MÁS LENTO (reducción drástica)
        const coolantConsumption = 0.04 + (this.coolantFlow * this.coolingSpeed) * 0.0001; // 200% más lento
        this.coolantLevel = Math.max(0, Math.min(100, this.coolantLevel - coolantConsumption));
        
        // AUMENTO DE GENERACIÓN DE ELECTRICIDAD (3x más rápido)
        const damageMultiplier = 1 - (this.damage / 100);
        this.powerOutput = Math.max(0, Math.min(1000, 
            reactivityFactor * 1000 * (1 - (this.temperature - 350) / 500) * damageMultiplier));
        
        // GENERACIÓN 3x MÁS RÁPIDA
        if (!this.levelComplete && this.powerOutput > 0) {
            this.totalPowerGenerated += this.powerOutput * 0.03; // Cambiado de 0.01 a 0.03
        }
        
        this.updateCoreVisual();
        this.checkLevelComplete();
    }
    
    updateCoreVisual() {
        const intensity = Math.min(1, (this.temperature - 200) / 400);
        
        if (this.damage > 75) {
            this.elements.reactorCore.classList.add('damaged', 'severe-damage');
        } else if (this.damage > 50) {
            this.elements.reactorCore.classList.add('damaged');
            this.elements.reactorCore.classList.remove('severe-damage');
        } else {
            this.elements.reactorCore.classList.remove('damaged', 'severe-damage');
        }
        
        const color = this.damage > 75 ? `rgba(255, 0, 0, 0.9)` : 
                     this.damage > 50 ? `rgba(255, 100, 0, 0.7)` : 
                     `rgba(255, ${Math.floor(102 - 102 * intensity)}, 0, ${0.5 + intensity * 0.5})`;
        const shadowSize = this.damage > 75 ? 40 : this.damage > 50 ? 25 : 20 * intensity;
        
        this.elements.reactorCore.style.boxShadow = `0 0 ${shadowSize}px ${color}`;
    }
    
    checkLevelComplete() {
        if (this.damage >= 100) {
            this.explodeReactor();
            return;
        }
        
        if (this.totalPowerGenerated >= this.levelTarget && !this.levelComplete) {
            this.levelComplete = true;
            this.powerOutput = 0;
            
            const nextBtn = document.getElementById('nextLevelBtn');
            if (nextBtn) nextBtn.style.display = 'block';
            
            setTimeout(() => {
                alert(`¡Nivel ${this.currentLevel} completado!\n\n` +
                      `Daño: ${Math.round(this.damage)}%\n` +
                      `Objetivo: ${Math.round(this.totalPowerGenerated)}/${this.levelTarget} MW`);
            }, 300);
        }
    }
    
    explodeReactor() {
        this.isOperating = false;
        this.powerOutput = 0;
        
        if (!this.elements.explosionDiv) {
            this.elements.explosionDiv = document.createElement('div');
            this.elements.explosionDiv.className = 'explosion';
            document.body.appendChild(this.elements.explosionDiv);
        }
        
        this.elements.reactorCore.classList.add('meltdown', 'damage-critical');
        this.elements.explosionDiv.style.display = 'block';
        
        setTimeout(() => {
            if (confirm(`¡MELTDOWN!\nNivel: ${this.currentLevel}\n¿Reiniciar?`)) {
                this.resetReactor();
            }
        }, 1500);
    }
    
    resetReactor() {
        Object.assign(this, {
            temperature: 350,
            pressure: 155,
            coolantLevel: 85,
            controlRods: 70,
            coolingSpeed: 50,
            coolantFlow: 75,
            powerOutput: 750,
            damage: 0,
            currentLevel: 1,
            levelTarget: 1000,
            totalPowerGenerated: 0,
            levelComplete: false,
            isOperating: true,
            isPaused: false,
            dataHistory: [],
            hasShownEmptyAlert: false
        });

        document.getElementById('controlRods').value = 70;
        document.getElementById('coolingSpeed').value = 50;
        document.getElementById('coolantFlow').value = 75;
        this.updateControlRods();
        document.getElementById('nextLevelBtn').style.display = 'none';
        
        if (this.elements.explosionDiv) this.elements.explosionDiv.style.display = 'none';
        this.elements.reactorCore.classList.remove('meltdown', 'damage-critical');
        
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        
        this.updateDisplay();
        alert('Simulador reiniciado. ¡Buena suerte!');
    }
    
    nextLevel() {
        this.currentLevel++;
        this.levelTarget = 1000 * this.currentLevel;
        this.totalPowerGenerated = 0;
        this.levelComplete = false;
        this.damage = Math.max(0, this.damage - 20);
        this.hasShownEmptyAlert = false;

        this.elements.levelDisplay.textContent = this.currentLevel;
        this.elements.targetDisplay.textContent = this.levelTarget;
        this.elements.currentLevelBadge.textContent = this.currentLevel;
        document.getElementById('nextLevelBtn').style.display = 'none';

        document.getElementById('controlRods').value = 70;
        document.getElementById('coolingSpeed').value = 50;
        document.getElementById('coolantFlow').value = 75;
        this.updateControlRods();

        alert(`¡Nivel ${this.currentLevel}!\nObjetivo: ${this.levelTarget} MW`);
    }
    
    rechargeCoolant() {
        if (this.coolantLevel < 100) {
            this.coolantLevel = Math.min(100, this.coolantLevel + 10);
            this.hasShownEmptyAlert = false;
            this.updateDisplay();
            this.totalPowerGenerated = Math.max(0, this.totalPowerGenerated - 50);
            alert(`Refrigerante recargado: ${Math.round(this.coolantLevel)}%\nCosto: 50 MW`);
        } else {
            alert('Refrigerante al máximo');
        }
    }
    
    emergencyScram() {
        this.controlRods = 100;
        document.getElementById('controlRods').value = 100;
        this.elements.rodValue.textContent = '100%';
        this.updateControlRods();
        
        setTimeout(() => {
            this.temperature = 250;
            this.powerOutput = 0;
            alert('SCRAM activado - Reactor en enfriamiento');
        }, 500);
    }
    
    setupChart() {
        const canvas = document.getElementById('trendsChart');
        const ctx = canvas.getContext('2d');
        this.chart = { canvas, ctx, maxPoints: 30 };
        
        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width - 20;
            canvas.height = 120;
        };
        resize();
        window.addEventListener('resize', resize);
    }
    
    updateChart() {
        if (this.dataHistory.length > 30) this.dataHistory.shift();
        this.dataHistory.push({
            temperature: this.temperature,
            pressure: this.pressure,
            power: this.powerOutput
        });

        const { canvas, ctx } = this.chart;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const drawLine = (data, color, max, min = 0) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            data.forEach((point, index) => {
                const x = (index / Math.max(data.length - 1, 1)) * canvas.width;
                const y = canvas.height - ((point - min) / (max - min)) * canvas.height;
                index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
        };

        drawLine(this.dataHistory.map(d => d.pressure), '#00ccff', 200, 100);
        drawLine(this.dataHistory.map(d => d.temperature), '#ff6600', 600, 200);
        drawLine(this.dataHistory.map(d => d.power), '#00ff00', 1000, 0);
    }
    
    updateDisplay() {
        this.elements.tempDisplay.textContent = Math.round(this.temperature) + '°C';
        this.elements.pressureBar.style.width = Math.min(100, this.pressure / 2) + '%';
        this.elements.pressureBar.textContent = Math.round(this.pressure) + ' bar';
        this.elements.coolantBar.style.width = this.coolantLevel + '%';
        this.elements.coolantBar.textContent = Math.round(this.coolantLevel) + '%';
        this.elements.powerBar.style.width = this.powerOutput / 10 + '%';
        this.elements.powerBar.textContent = Math.round(this.powerOutput) + ' MW';
        this.elements.powerValue.textContent = Math.round(this.powerOutput) + ' MW';
        
        this.elements.damageBar.style.width = this.damage + '%';
        this.elements.damageValue.textContent = Math.round(this.damage) + '%';
        
        const progressPercent = (this.totalPowerGenerated / this.levelTarget * 100);
        this.elements.progressDisplay.style.width = Math.min(100, progressPercent) + '%';
        this.elements.progressDisplay.textContent = `${Math.round(this.totalPowerGenerated)}/${this.levelTarget} MW`;
        
        // Alerta única de refrigerante vacío
        if (this.coolantLevel <= 0 && !this.hasShownEmptyAlert) {
            this.hasShownEmptyAlert = true;
            alert('¡Sin refrigerante! El reactor se sobrecalentará.');
            this.temperature += 50;
        } else if (this.coolantLevel > 0) {
            this.hasShownEmptyAlert = false;
        }
        
        this.checkAlarms();
    }
    
    checkAlarms() {
        // Resetear todas las alertas
        this.elements.criticalAlert.style.display = 'none';
        this.elements.warningAlert.style.display = 'none';
        
        // Resetear indicadores
        this.elements.reactorStatus.className = 'status-indicator status-normal';
        this.elements.coolantStatus.className = 'status-indicator status-normal';
        
        // ALERTA CRÍTICA - Prioridad máxima
        if (this.temperature > 450 || this.damage > 80) {
            this.elements.criticalAlert.style.display = 'block';
            this.elements.criticalAlert.textContent = '¡CRÍTICO! Temperatura o daño elevado';
            this.elements.reactorStatus.className = 'status-indicator status-critical';
            this.elements.reactorState.textContent = '¡CRÍTICO!';
        }
        // ALERTA POR DAÑO ALTO
        else if (this.damage > 60) {
            this.elements.warningAlert.style.display = 'block';
            this.elements.warningAlert.textContent = '¡Advertencia! Reactor dañado';
            this.elements.reactorStatus.className = 'status-indicator status-warning';
            this.elements.reactorState.textContent = 'Dañado';
        }
        // ALERTA POR TEMPERATURA/PRESIÓN/REFRIGERANTE
        else if (this.temperature > 400 || this.pressure > 180 || this.coolantLevel < 30) {
            this.elements.warningAlert.style.display = 'block';
            this.elements.warningAlert.textContent = 'Parámetros fuera de rango seguro';
            this.elements.reactorStatus.className = 'status-indicator status-warning';
            this.elements.reactorState.textContent = 'Alerta';
        }
        // TODO NORMAL
        else {
            this.elements.reactorState.textContent = 'Normal';
        }
        
        // ESTADO REFRIGERANTE
        if (this.coolantLevel < 20) {
            this.elements.coolantStatus.className = 'status-indicator status-critical';
            this.elements.coolantState.textContent = 'Crítico';
        } else if (this.coolantLevel < 40) {
            this.elements.coolantStatus.className = 'status-indicator status-warning';
            this.elements.coolantState.textContent = 'Bajo';
        } else {
            this.elements.coolantStatus.className = 'status-indicator status-normal';
            this.elements.coolantState.textContent = 'Normal';
        }
        
        // Estado de pausa
        if (this.isPaused) {
            this.elements.reactorState.textContent = 'PAUSADO';
            this.elements.reactorStatus.className = 'status-indicator status-warning';
        }
    }
    
    startSimulation() {
        setInterval(() => {
            if (this.isOperating && !this.isPaused) {
                this.calculateReactorPhysics();
                this.updateDisplay();
                this.updateChart();
            }
        }, 400);
    }
}

// Hacer métodos globales para poder llamarlos desde HTML
window.reactor = new NuclearReactor();