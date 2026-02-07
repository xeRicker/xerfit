import { Component } from '../core/Component.js';
import { Icons } from '../core/Icons.js';

export class Dashboard extends Component {
    render(totals, targets) {
        const progress = Math.min((totals.cal / targets.targetCal) * 100, 100);
        const left = Math.max(0, Math.round(targets.targetCal - totals.cal));
        const pPct = Math.min((totals.p / targets.targetP) * 100, 100);
        const cPct = Math.min((totals.c / targets.targetC) * 100, 100);
        const fPct = Math.min((totals.f / targets.targetF) * 100, 100);

        this.container.innerHTML = `
            <div class="card" style="padding: 18px; background: linear-gradient(160deg, #1d2a20 0%, #121b14 100%);">
                <div style="display:grid; grid-template-columns: 1fr auto; gap: 12px; align-items:center; margin-bottom: 16px;">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; color: var(--text-sub); font-size:11px; text-transform:uppercase; letter-spacing:1px;">
                            <span style="width:16px; height:16px; color: var(--neon-green);">${Icons.calories}</span>
                            Calorie Summary
                        </div>
                        <div style="font-size:34px; font-weight:800; line-height:1.05; margin-top:6px;">
                            ${Math.round(totals.cal)} <span style="font-size:15px; color:var(--text-sub);">/ ${targets.targetCal}</span>
                        </div>
                        <div style="font-size:12px; color: var(--neon-green-soft); margin-top:4px;">${left} kcal left today</div>
                    </div>
                    <div style="width:68px; height:68px; border-radius:50%; background:conic-gradient(var(--neon-green) ${progress}%, rgba(255,255,255,.1) 0); display:grid; place-items:center;">
                        <div style="width:56px; height:56px; border-radius:50%; background: #111912; display:grid; place-items:center; font-size:12px; font-weight:700;">${Math.round(progress)}%</div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
                    ${this.macroCard('Protein', totals.p, targets.targetP, pPct, '#6bffb0')}
                    ${this.macroCard('Carbs', totals.c, targets.targetC, cPct, '#7edfff')}
                    ${this.macroCard('Fat', totals.f, targets.targetF, fPct, '#c7a5ff')}
                </div>
            </div>
        `;
    }

    macroCard(name, value, target, pct, color) {
        return `
            <div style="padding:10px; border-radius:14px; background: rgba(255,255,255,0.03); border:1px solid var(--line-soft);">
                <div style="font-size:11px; color:var(--text-sub);">${name}</div>
                <div style="font-size:13px; margin:4px 0 7px; font-weight:700;">${Math.round(value)} / ${target}g</div>
                <div style="height:5px; background: rgba(255,255,255,0.08); border-radius:999px; overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:${color}; box-shadow:0 0 10px ${color};"></div>
                </div>
            </div>
        `;
    }
}
