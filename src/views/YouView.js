import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';

const MACRO_KCAL = { p: 4, c: 4, f: 9 };

export class YouView extends Component {
    constructor(container) {
        super(container);
        this.draft = null;
        this.unsub = store.subscribe(s => this.update(s));
    }

    ensureDraft(state) {
        if (!this.draft) this.draft = { ...state.user };
    }

    normalizeDraft() {
        this.draft = {
            ...this.draft,
            weight: Number(this.draft.weight) || 0,
            height: Number(this.draft.height) || 0,
            age: Number(this.draft.age) || 0,
            activity: Number(this.draft.activity) || 1.2,
            targetCal: Number(this.draft.targetCal) || 0,
            targetP: Number(this.draft.targetP) || 0,
            targetC: Number(this.draft.targetC) || 0,
            targetF: Number(this.draft.targetF) || 0
        };
    }

    getMacroKcal() {
        return (this.draft.targetP * MACRO_KCAL.p) + (this.draft.targetC * MACRO_KCAL.c) + (this.draft.targetF * MACRO_KCAL.f);
    }

    getMacroDelta() {
        return Math.round(this.getMacroKcal() - this.draft.targetCal);
    }

    hasChanges(state) {
        const keys = ['weight', 'height', 'age', 'sex', 'activity', 'targetCal', 'targetP', 'targetC', 'targetF'];
        return keys.some(key => Number.isFinite(this.draft[key])
            ? Number(this.draft[key]) !== Number(state.user[key])
            : this.draft[key] !== state.user[key]);
    }

    autoFillMacros() {
        const calories = Math.max(0, Number(this.draft.targetCal) || 0);
        const p = Math.round((calories * 0.3) / 4);
        const f = Math.round((calories * 0.25) / 9);
        const used = (p * 4) + (f * 9);
        const c = Math.max(0, Math.round((calories - used) / 4));
        this.draft.targetP = p;
        this.draft.targetF = f;
        this.draft.targetC = c;
    }

    update(state) {
        this.ensureDraft(state);
        this.normalizeDraft();

        const changed = this.hasChanges(state);
        const macroDelta = this.getMacroDelta();
        const canSave = changed;

        this.container.innerHTML = `
            <header style="padding: calc(var(--safe-top) + 20px) 20px 10px;">
                <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.4px;">Ustawienia</h1>
                <p style="color: var(--text-sub); margin-top: 4px;">Dane odświeżają się na żywo, a zapis aktywuje się tylko po zmianach.</p>
            </header>

            <div style="padding: 0 16px;">
                <div class="card" style="margin: 0 0 14px 0;">
                    <h3 style="margin-bottom: 14px; font-size: 14px; color: var(--accent-purple);">DANE PODSTAWOWE</h3>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div class="input-group">
                            <label class="input-label">Waga (kg)</label>
                            <input type="number" id="u-weight" class="input-field" value="${this.draft.weight}">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Wzrost (cm)</label>
                            <input type="number" id="u-height" class="input-field" value="${this.draft.height}">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                        <div class="input-group">
                            <label class="input-label">Wiek</label>
                            <input type="number" id="u-age" class="input-field" value="${this.draft.age || 25}">
                        </div>
                        <div class="input-group">
                            <label class="input-label">Płeć</label>
                            <select id="u-sex" class="input-field">
                                <option value="male" ${this.draft.sex === 'male' ? 'selected' : ''}>Mężczyzna</option>
                                <option value="female" ${this.draft.sex === 'female' ? 'selected' : ''}>Kobieta</option>
                            </select>
                        </div>
                    </div>
                    <div class="input-group" style="margin-bottom:0;">
                        <label class="input-label" id="activity-label">Aktywność (${Number(this.draft.activity || 1.4).toFixed(2)})</label>
                        <input type="range" min="1.2" max="2.0" step="0.05" id="u-activity" value="${this.draft.activity || 1.4}" class="smooth-range" style="width:100%; accent-color: var(--accent-main);">
                    </div>
                </div>

                <div class="card" style="margin: 0 0 20px 0;">
                    <h3 style="margin-bottom: 14px; font-size: 14px; color: var(--accent-main);">DZIENNE CELE</h3>
                    <div class="input-group">
                        <label class="input-label">Kalorie</label>
                        <input type="number" id="u-cal" class="input-field" value="${this.draft.targetCal}">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                        <div class="input-group"><label class="input-label">Białko (g)</label><input type="number" id="u-p" class="input-field" value="${this.draft.targetP}"></div>
                        <div class="input-group"><label class="input-label">Tłuszcze (g)</label><input type="number" id="u-f" class="input-field" value="${this.draft.targetF}"></div>
                        <div class="input-group"><label class="input-label">Węgle (g)</label><input type="number" id="u-c" class="input-field" value="${this.draft.targetC}"></div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr auto; gap:8px; align-items:center; margin-top: 4px;">
                        <div id="macro-status" style="font-size: 12px; color:${Math.abs(macroDelta) <= 50 ? 'var(--accent-soft)' : 'var(--accent-red)'};">
                            Makra = ${Math.round(this.getMacroKcal())} kcal · różnica ${macroDelta > 0 ? '+' : ''}${macroDelta} kcal
                        </div>
                        <button id="auto-macros" class="input-field" style="text-align:center; padding:8px 10px; width:auto;">Auto makra</button>
                    </div>
                </div>

                <button id="save-profile" class="btn-primary" ${canSave ? '' : 'disabled'}>Zapisz zmiany</button>
            </div>
            <div style="height: 100px;"></div>
        `;

        this.bindEvents(state);
        this.refreshComputed(state);
    }

    syncDraft() {
        this.draft = {
            ...this.draft,
            weight: Number(this.container.querySelector('#u-weight').value),
            height: Number(this.container.querySelector('#u-height').value),
            age: Number(this.container.querySelector('#u-age').value),
            sex: this.container.querySelector('#u-sex').value,
            activity: Number(this.container.querySelector('#u-activity').value),
            targetCal: Number(this.container.querySelector('#u-cal').value),
            targetP: Number(this.container.querySelector('#u-p').value),
            targetF: Number(this.container.querySelector('#u-f').value),
            targetC: Number(this.container.querySelector('#u-c').value)
        };
        this.normalizeDraft();
    }

    bindEvents(state) {
        const selectors = ['#u-weight', '#u-height', '#u-age', '#u-sex', '#u-activity', '#u-cal', '#u-p', '#u-f', '#u-c'];
        selectors.forEach(sel => {
            const el = this.container.querySelector(sel);
            if (!el) return;
            const handler = () => {
                this.syncDraft();
                this.refreshComputed(state);
            };
            el.oninput = handler;
            el.onchange = handler;
        });

        this.container.querySelector('#auto-macros').onclick = () => {
            this.syncDraft();
            this.autoFillMacros();
            ['#u-p', '#u-f', '#u-c'].forEach(sel => {
                const el = this.container.querySelector(sel);
                if (el) el.value = this.draft[sel === '#u-p' ? 'targetP' : sel === '#u-f' ? 'targetF' : 'targetC'];
            });
            this.refreshComputed(state);
        };

        this.container.querySelector('#save-profile').onclick = () => {
            this.syncDraft();
            if (!this.hasChanges(state)) return;
            store.updateUser(this.draft);
            const btn = this.container.querySelector('#save-profile');
            const original = btn.innerText;
            btn.innerText = 'Zapisano!';
            setTimeout(() => { btn.innerText = original; }, 1000);
        };
    }

    refreshComputed(state) {
        const activityLabel = this.container.querySelector('#activity-label');
        if (activityLabel) activityLabel.textContent = `Aktywność (${Number(this.draft.activity || 1.4).toFixed(2)})`;

        const macroDelta = this.getMacroDelta();
        const macroStatus = this.container.querySelector('#macro-status');
        if (macroStatus) {
            macroStatus.textContent = `Makra = ${Math.round(this.getMacroKcal())} kcal · różnica ${macroDelta > 0 ? '+' : ''}${macroDelta} kcal`;
            macroStatus.style.color = Math.abs(macroDelta) <= 50 ? 'var(--accent-soft)' : 'var(--accent-red)';
        }

        const saveBtn = this.container.querySelector('#save-profile');
        if (saveBtn) saveBtn.disabled = !this.hasChanges(state);
    }

    destroy() { this.unsub(); }
}
