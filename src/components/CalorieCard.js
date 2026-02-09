import { Component } from '../core/Component.js';
import { Icons } from '../core/Icons.js';

export class CalorieCard extends Component {
    render(totals, targets) {
        const pPct = Math.min((totals.p / targets.targetP) * 100, 100);
        const cPct = Math.min((totals.c / targets.targetC) * 100, 100);
        const fPct = Math.min((totals.f / targets.targetF) * 100, 100);

        this.container.innerHTML = `
            <div class="card" style="padding: 24px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 14px; color: var(--text-sub); font-weight: 600; text-transform: uppercase;">Calories</div>
                        <div style="font-size: 36px; font-weight: 800; letter-spacing: -1px; display: flex; align-items: center; gap: 8px;">
                            <div style="width:24px; height:24px;">${Icons.fire}</div>
                            <span id="cal-count">${Math.round(totals.cal)}</span>
                            <span style="font-size: 16px; color: var(--text-sub); font-weight: 500;">/ ${targets.targetCal}</span>
                        </div>
                    </div>
                </div>

                <!-- Macros -->
                <div style="display: grid; gap: 16px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                            <span style="color: var(--macro-protein);">Protein</span>
                            <span>${Math.round(totals.p)} / ${targets.targetP}g</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${pPct}%; background: linear-gradient(90deg, rgba(10,132,255,.65), var(--macro-protein));"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                            <span style="color: var(--macro-carb);">Carbs</span>
                            <span>${Math.round(totals.c)} / ${targets.targetC}g</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${cPct}%; background: linear-gradient(90deg, rgba(48,209,88,.65), var(--macro-carb));"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; margin-bottom: 4px;">
                            <span style="color: var(--macro-fat);">Fat</span>
                            <span>${Math.round(totals.f)} / ${targets.targetF}g</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${fPct}%; background: linear-gradient(90deg, rgba(255,55,95,.65), var(--macro-fat));"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}