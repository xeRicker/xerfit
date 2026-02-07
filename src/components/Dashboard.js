import { Component } from '../core/Component.js';

export class Dashboard extends Component {
    render(totals, targets) {
        const pPct = Math.min((totals.p / targets.targetP) * 100, 100);
        const cPct = Math.min((totals.c / targets.targetC) * 100, 100);
        const fPct = Math.min((totals.f / targets.targetF) * 100, 100);

        this.container.innerHTML = `
            <div class="card" style="padding: 20px; border: 1px solid #333; background: linear-gradient(180deg, #1E1E1E 0%, #121212 100%);">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">
                    <div>
                        <div style="font-size: 11px; color: var(--text-sub); text-transform: uppercase; letter-spacing: 1px;">Calories</div>
                        <div style="font-size: 32px; font-weight: 800; color: white;">
                            ${Math.round(totals.cal)} 
                            <span style="font-size: 16px; color: var(--text-dim); font-weight: 500;">/ ${targets.targetCal}</span>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: var(--neon-blue);">${Math.round(targets.targetCal - totals.cal)} left</div>
                    </div>
                </div>

                <!-- Compact Macro Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                    <!-- Protein -->
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; color: var(--text-sub);">
                            <span>Prot</span>
                            <span>${Math.round(totals.p)}/${targets.targetP}</span>
                        </div>
                        <div style="height: 4px; background: #333; border-radius: 2px;">
                            <div style="height: 100%; width: ${pPct}%; background: var(--neon-green); border-radius: 2px; box-shadow: 0 0 8px rgba(0,230,118,0.4);"></div>
                        </div>
                    </div>
                    <!-- Carbs -->
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; color: var(--text-sub);">
                            <span>Carb</span>
                            <span>${Math.round(totals.c)}/${targets.targetC}</span>
                        </div>
                        <div style="height: 4px; background: #333; border-radius: 2px;">
                            <div style="height: 100%; width: ${cPct}%; background: var(--neon-blue); border-radius: 2px; box-shadow: 0 0 8px rgba(0,229,255,0.4);"></div>
                        </div>
                    </div>
                    <!-- Fat -->
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; color: var(--text-sub);">
                            <span>Fat</span>
                            <span>${Math.round(totals.f)}/${targets.targetF}</span>
                        </div>
                        <div style="height: 4px; background: #333; border-radius: 2px;">
                            <div style="height: 100%; width: ${fPct}%; background: var(--neon-purple); border-radius: 2px; box-shadow: 0 0 8px rgba(213,0,249,0.4);"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}