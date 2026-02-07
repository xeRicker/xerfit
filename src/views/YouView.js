import { Component } from '../core/Component.js';
import { store } from '../core/Store.js';

const MACRO_KCAL = { p: 4, c: 4, f: 9 };
const PROTEIN_FACTORS = { low: 1.8, medium: 2.0, high: 2.2 };

export class YouView extends Component {
    constructor(container) {
        super(container);
        this.draft = null;
        this.unsub = store.subscribe(s => this.update(s));
    }

    ensureDraft(state) { if (!this.draft) this.draft = { ...state.user }; }
    normalizeDraft() {
        this.draft = { ...this.draft, weight: Number(this.draft.weight) || 0, height: Number(this.draft.height) || 0, age: Number(this.draft.age) || 0, activity: Number(this.draft.activity) || 1.2, targetCal: Number(this.draft.targetCal) || 0, targetP: Number(this.draft.targetP) || 0, targetC: Number(this.draft.targetC) || 0, targetF: Number(this.draft.targetF) || 0, proteinMode: this.draft.proteinMode || 'medium' };
    }
    getMacroKcal() { return (this.draft.targetP * MACRO_KCAL.p) + (this.draft.targetC * MACRO_KCAL.c) + (this.draft.targetF * MACRO_KCAL.f); }
    hasChanges(state) { return ['weight', 'height', 'age', 'sex', 'activity', 'targetCal', 'targetP', 'targetC', 'targetF', 'proteinMode'].some(k => String(this.draft[k]) !== String(state.user[k])); }

    autoFillMacros() {
        const calories = Math.max(0, Number(this.draft.targetCal) || 0);
        const proteinFactor = PROTEIN_FACTORS[this.draft.proteinMode] || 2;
        const p = Math.round((Number(this.draft.weight) || 0) * proteinFactor);
        const f = Math.round(((calories * 0.27) / 9));
        const c = Math.max(0, Math.round((calories - (p * 4) - (f * 9)) / 4));
        this.draft.targetP = p; this.draft.targetF = f; this.draft.targetC = c;
    }

    update(state) {
        this.ensureDraft(state); this.normalizeDraft();
        const macroDelta = Math.round(this.getMacroKcal() - this.draft.targetCal);
        this.container.innerHTML = `<header style="padding: 14px 20px 10px;"><h1 style="font-size: 24px; font-weight: 800;">Ustawienia</h1></header><div style="padding: 0 16px;"><div class="card" style="margin:0 0 14px 0;"><h3 style="margin-bottom: 14px; font-size: 14px; color: var(--accent-purple);">Dane podstawowe</h3><div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;"><div class="input-group"><label class="input-label">Waga</label><input type="number" id="u-weight" class="input-field" value="${this.draft.weight}"></div><div class="input-group"><label class="input-label">Wzrost</label><input type="number" id="u-height" class="input-field" value="${this.draft.height}"></div></div><div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;"><div class="input-group"><label class="input-label">Wiek</label><input type="number" id="u-age" class="input-field" value="${this.draft.age || 25}"></div><div class="input-group"><label class="input-label">Płeć</label><select id="u-sex" class="input-field"><option value="male" ${this.draft.sex === 'male' ? 'selected' : ''}>Mężczyzna</option><option value="female" ${this.draft.sex === 'female' ? 'selected' : ''}>Kobieta</option></select></div></div></div><div class="card" style="margin: 0 0 20px 0;"><h3 style="margin-bottom: 14px; font-size: 14px; color: var(--accent-main);">Dzienne cele</h3><div class="input-group"><label class="input-label">Kalorie</label><input type="number" id="u-cal" class="input-field" value="${this.draft.targetCal}"></div><div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;"><div class="input-group"><label class="input-label">Auto (białko / kg)</label><select id="u-protein-mode" class="input-field"><option value="low" ${this.draft.proteinMode === 'low' ? 'selected' : ''}>Niska aktywność (1.8)</option><option value="medium" ${this.draft.proteinMode === 'medium' ? 'selected' : ''}>Średnia aktywność (2.0)</option><option value="high" ${this.draft.proteinMode === 'high' ? 'selected' : ''}>Wysoka aktywność (2.2)</option></select></div><button id="auto-macros" class="input-field" style="height:45px;align-self:end;">Auto</button></div><div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;"><div class="input-group"><label class="input-label">Białko</label><input type="number" id="u-p" class="input-field" value="${this.draft.targetP}"></div><div class="input-group"><label class="input-label">Tłuszcze</label><input type="number" id="u-f" class="input-field" value="${this.draft.targetF}"></div><div class="input-group"><label class="input-label">Węgle</label><input type="number" id="u-c" class="input-field" value="${this.draft.targetC}"></div></div><div id="macro-status" style="font-size: 12px; color:${Math.abs(macroDelta) <= 50 ? 'var(--accent-soft)' : 'var(--accent-red)'};">Makra = ${Math.round(this.getMacroKcal())} kcal · różnica ${macroDelta > 0 ? '+' : ''}${macroDelta} kcal</div></div><button id="save-profile" class="btn-primary" ${this.hasChanges(state) ? '' : 'disabled'}>Zapisz zmiany</button></div><div style="height:100px"></div>`;
        this.bindEvents(state);
    }

    syncDraft() {
        this.draft = { ...this.draft, weight: Number(this.container.querySelector('#u-weight').value), height: Number(this.container.querySelector('#u-height').value), age: Number(this.container.querySelector('#u-age').value), sex: this.container.querySelector('#u-sex').value, targetCal: Number(this.container.querySelector('#u-cal').value), targetP: Number(this.container.querySelector('#u-p').value), targetF: Number(this.container.querySelector('#u-f').value), targetC: Number(this.container.querySelector('#u-c').value), proteinMode: this.container.querySelector('#u-protein-mode').value };
        this.normalizeDraft();
    }

    bindEvents(state) {
        ['#u-weight', '#u-height', '#u-age', '#u-sex', '#u-cal', '#u-p', '#u-f', '#u-c', '#u-protein-mode'].forEach(sel => { const el = this.container.querySelector(sel); if (!el) return; el.oninput = () => { this.syncDraft(); this.refreshComputed(state); }; el.onchange = () => { this.syncDraft(); this.refreshComputed(state); }; });
        this.container.querySelector('#auto-macros').onclick = () => { this.syncDraft(); this.autoFillMacros(); this.container.querySelector('#u-p').value = this.draft.targetP; this.container.querySelector('#u-f').value = this.draft.targetF; this.container.querySelector('#u-c').value = this.draft.targetC; this.refreshComputed(state); };
        this.container.querySelector('#save-profile').onclick = () => { this.syncDraft(); if (!this.hasChanges(state)) return; store.updateUser(this.draft); };
    }

    refreshComputed(state) {
        const macroDelta = Math.round(this.getMacroKcal() - this.draft.targetCal);
        const el = this.container.querySelector('#macro-status');
        if (el) { el.textContent = `Makra = ${Math.round(this.getMacroKcal())} kcal · różnica ${macroDelta > 0 ? '+' : ''}${macroDelta} kcal`; el.style.color = Math.abs(macroDelta) <= 50 ? 'var(--accent-soft)' : 'var(--accent-red)'; }
        const save = this.container.querySelector('#save-profile');
        if (save) save.disabled = !this.hasChanges(state);
    }
    }

    destroy() { this.unsub(); 
}