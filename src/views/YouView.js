import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';

export class YouView extends Component {
    constructor(container) {
        super(container);
        this.unsub = store.subscribe(s => this.update(s));
    }

    update(state) {
        const u = state.user;
        const tdee = store.calculateTDEE();

        this.container.innerHTML = `
            <header style="padding: calc(var(--safe-top) + 20px) 20px 10px;">
                <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Ustawienia</h1>
            </header>

            <div style="padding: 0 16px;">
                <div class="card" style="margin: 0 0 16px 0;">
                    <h3 style="margin-bottom: 16px; font-size: 14px; color: var(--accent-purple);">DANE</h3>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div class="input-group">
                            <label class="input-label">Waga (kg)</label>
                            <input type="number" id="u-weight" class="input-field" value="${u.weight}">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Wzrost (cm)</label>
                            <input type="number" id="u-height" class="input-field" value="${u.height}">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div class="input-group">
                            <label class="input-label">Wiek</label>
                            <input type="number" id="u-age" class="input-field" value="${u.age || 25}">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Płeć</label>
                            <select id="u-sex" class="input-field">
                                <option value="male" ${u.sex === 'male' ? 'selected' : ''}>Mężczyzna</option>
                                <option value="female" ${u.sex === 'female' ? 'selected' : ''}>Kobieta</option>
                            </select>
                        </div>
                    </div>
                    <div class="input-group" style="margin-bottom:0;">
                        <label class="input-label">Aktywność (${u.activity || 1.4})</label>
                        <input type="range" min="1.2" max="2.0" step="0.05" id="u-activity" value="${u.activity || 1.4}" style="width:100%; accent-color: var(--accent-main);">
                    </div>
                </div>

                <div class="card" style="margin: 0 0 16px 0;">
                    <h3 style="margin-bottom: 12px; font-size: 14px; color: var(--accent-main);">TDEE podpowiedź</h3>
                    <div style="font-size:13px; color:var(--text-sub); margin-bottom:8px;">Twoje szacowane TDEE: <strong style="color:var(--text-main);">${tdee} kcal</strong>.</div>
                    <div style="font-size:12px; color:var(--text-dim); margin-bottom:10px;">Chcesz użyć tego wyniku jako dziennego celu kalorii?</div>
                    <button id="apply-tdee" class="input-field" style="text-align:center; border-color: var(--line-strong); color:var(--accent-main);">Ustaw TDEE jako target kalorii</button>
                </div>

                <div class="card" style="margin: 0 0 24px 0;">
                    <h3 style="margin-bottom: 16px; font-size: 14px; color: var(--accent-main);">DZIENNE CELE</h3>
                    <div class="input-group">
                        <label class="input-label">Kalorie</label>
                        <input type="number" id="u-cal" class="input-field" value="${u.targetCal}">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <div class="input-group">
                            <label class="input-label">Białko</label>
                            <input type="number" id="u-p" class="input-field" value="${u.targetP}">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Tłuszcze</label>
                            <input type="number" id="u-f" class="input-field" value="${u.targetF}">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Węgle</label>
                            <input type="number" id="u-c" class="input-field" value="${u.targetC}">
                        </div>
                    </div>
                </div>

                <button id="save-profile" class="btn-primary">Zapisz zmiany</button>
            </div>
            <div style="height: 100px;"></div>
        `;

        this.container.querySelector('#apply-tdee').onclick = () => {
            store.updateUser({ targetCal: tdee });
        };

        this.container.querySelector('#save-profile').onclick = () => {
            store.updateUser({
                weight: Number(document.getElementById('u-weight').value),
                height: Number(document.getElementById('u-height').value),
                age: Number(document.getElementById('u-age').value),
                sex: document.getElementById('u-sex').value,
                activity: Number(document.getElementById('u-activity').value),
                targetCal: Number(document.getElementById('u-cal').value),
                targetP: Number(document.getElementById('u-p').value),
                targetF: Number(document.getElementById('u-f').value),
                targetC: Number(document.getElementById('u-c').value)
            });
            const btn = document.getElementById('save-profile');
            const original = btn.innerText;
            btn.innerText = 'Zapisano!';
            setTimeout(() => { btn.innerText = original; }, 1200);
        };
    }

    destroy() { this.unsub(); }
}
