import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';

export class YouView extends Component {
    constructor(container) {
        super(container);
        this.unsub = store.subscribe(s => this.update(s));
    }

    update(state) {
        const u = state.user;
        this.container.innerHTML = `
            <header style="padding: calc(var(--safe-top) + 20px) 20px 10px;">
                <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Settings</h1>
            </header>

            <div style="padding: 0 16px;">
                <div class="card" style="margin: 0 0 16px 0;">
                    <h3 style="margin-bottom: 16px; font-size: 14px; color: var(--neon-purple);">BODY STATS</h3>
                    <div class="input-group">
                        <label class="input-label">Weight (kg)</label>
                        <input type="number" id="u-weight" class="input-field" value="${u.weight}">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Height (cm)</label>
                        <input type="number" id="u-height" class="input-field" value="${u.height}">
                    </div>
                </div>

                <div class="card" style="margin: 0 0 24px 0;">
                    <h3 style="margin-bottom: 16px; font-size: 14px; color: var(--neon-green);">DAILY TARGETS</h3>
                    <div class="input-group">
                        <label class="input-label">Calories</label>
                        <input type="number" id="u-cal" class="input-field" value="${u.targetCal}" style="color: var(--neon-blue); font-weight: bold;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <div class="input-group">
                            <label class="input-label">Prot</label>
                            <input type="number" id="u-p" class="input-field" value="${u.targetP}">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Carb</label>
                            <input type="number" id="u-c" class="input-field" value="${u.targetC}">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Fat</label>
                            <input type="number" id="u-f" class="input-field" value="${u.targetF}">
                        </div>
                    </div>
                </div>

                <button id="save-profile" class="btn-primary">Save Changes</button>
            </div>
            <div style="height: 100px;"></div>
        `;

        this.container.querySelector('#save-profile').onclick = () => {
            store.updateUser({
                weight: Number(document.getElementById('u-weight').value),
                height: Number(document.getElementById('u-height').value),
                targetCal: Number(document.getElementById('u-cal').value),
                targetP: Number(document.getElementById('u-p').value),
                targetC: Number(document.getElementById('u-c').value),
                targetF: Number(document.getElementById('u-f').value),
            });
            const btn = document.getElementById('save-profile');
            const originalText = btn.innerText;
            btn.innerText = "Saved!";
            btn.style.background = "var(--neon-green)";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = "";
            }, 1500);
        };
    }

    destroy() { this.unsub(); }
}