import { Component } from '../core/Component.js';
import { Icons } from '../core/Icons.js';

export class Dashboard extends Component {
    render(totals, targets) {
        const progress = Math.min((totals.cal / targets.targetCal) * 100, 100);
        const left = Math.round(targets.targetCal - totals.cal);
        const burnClass = totals.cal >= 1500 ? 'cal-bomb' : totals.cal >= 1000 ? 'cal-hot' : '';

        this.container.innerHTML = `
            <div class="card" style="padding:18px; background: var(--grad-liquid); box-shadow: var(--glow-main);">
                <div style="display:grid; grid-template-columns: 1fr auto; gap:12px; align-items:center; margin-bottom:16px;">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px; color: var(--text-sub); font-size:11px; text-transform:uppercase; letter-spacing:1px;">
                            <span style="width:16px; height:16px; color: var(--accent-main);">${Icons.calories}</span>
                            Podsumowanie kalorii
                        </div>
                        <div class="cal-value ${burnClass}" style="font-size:34px; font-weight:800; line-height:1.05; margin-top:6px;">
                            ${Math.round(totals.cal)} <span style="font-size:15px; color:var(--text-sub);">/ ${targets.targetCal}</span>
                        </div>
                        <div style="font-size:12px; color: ${left < 0 ? 'var(--accent-red)' : 'var(--accent-soft)'}; margin-top:4px; display:flex; align-items:center; gap:6px;">
                            ${left < 0 ? `<span style="width:13px; height:13px;">${Icons.warning}</span>` : ''}
                            ${left >= 0 ? `Pozostało ${left} kcal` : `Przekroczenie o ${Math.abs(left)} kcal`}
                        </div>
                    </div>
                    <div style="width:68px; height:68px; border-radius:50%; background:conic-gradient(var(--macro-cal) ${progress}%, rgba(255,255,255,.16) 0); display:grid; place-items:center; box-shadow:0 8px 24px rgba(255,106,0,.28);">
                        <div style="width:56px; height:56px; border-radius:50%; background: var(--bg-elevated); display:grid; place-items:center; font-size:12px; font-weight:700;">${Math.round(progress)}%</div>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px;">
                    ${this.macroCard('Białko', totals.p, targets.targetP, 'var(--macro-protein)')}
                    ${this.macroCard('Tłuszcze', totals.f, targets.targetF, 'var(--macro-fat)')}
                    ${this.macroCard('Węgle', totals.c, targets.targetC, 'var(--macro-carb)')}
                </div>
            </div>
        `;
    }

    macroCard(name, value, target, color) {
        const pct = Math.min((value / target) * 100, 100);
        const over = value > target;
        return `
            <div style="padding:10px; border-radius:14px; background: rgba(255,255,255,0.03); border:1px solid ${over ? 'rgba(255,107,122,.5)' : 'var(--line-soft)'};">
                <div style="font-size:11px; color:var(--text-sub); display:flex; align-items:center; gap:4px;">${name} ${over ? `<span style="color:var(--accent-red); width:11px; height:11px;">${Icons.warning}</span>` : ''}</div>
                <div style="font-size:13px; margin:4px 0 7px; font-weight:700;">${Math.round(value)} / ${target}g ${over ? '<span style="color:var(--accent-red)">!</span>' : ''}</div>
                <div style="height:5px; background: rgba(255,255,255,0.08); border-radius:999px; overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:${color}; box-shadow:0 0 10px ${color};"></div>
                </div>
            </div>
        `;
    }
}
