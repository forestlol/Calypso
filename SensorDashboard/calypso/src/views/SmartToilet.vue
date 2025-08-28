<template>
    <div class="toilet-page">
        <!-- Header / Meta -->
        <div class="page-header">
            <div class="title-wrap">
                <span class="badge">Smart Facility</span>
                <h1>Smart Toilet – Block B, Level 2</h1>
                <p class="subtitle">Live hygiene metrics & consumables overview</p>
            </div>
            <div class="right-meta">
                <div class="meta-chip">
                    <span class="dot" :class="statusColor"></span>{{ statusText }}
                </div>
                <div class="meta-chip">
                    Updated: <strong>{{ lastUpdated }}</strong>
                </div>
            </div>
        </div>

        <!-- KPI Cards -->
        <section class="grid kpi-grid">
            <div class="card kpi" v-for="k in kpis" :key="k.label">
                <div class="kpi-top">
                    <div class="kpi-icon" :style="{ background: k.bg }">
                        <i :class="k.icon"></i>
                    </div>
                    <div class="kpi-label">{{ k.label }}</div>
                </div>
                <div class="kpi-value">
                    {{ k.value }}
                    <small v-if="k.unit">{{ k.unit }}</small>
                </div>
                <div class="kpi-sub" v-if="k.sub">{{ k.sub }}</div>
            </div>
        </section>

        <!-- Charts -->
        <section class="grid charts-grid">
            <div class="card chart-card">
                <div class="card-header">
                    <h3>Water Flow (L/min) • Today</h3>
                    <div class="actions">
                        <button class="chip" @click="setPeriod('1D')" :class="{ active: period === '1D' }">1D</button>
                        <button class="chip" @click="setPeriod('1W')" :class="{ active: period === '1W' }">1W</button>
                        <button class="chip" @click="setPeriod('1M')" :class="{ active: period === '1M' }">1M</button>
                    </div>
                </div>
                <div class="chart-wrap">
                    <canvas ref="flowChart"></canvas>
                </div>
            </div>

            <div class="card chart-card">
                <div class="card-header">
                    <h3>Consumables Levels</h3>
                    <div class="legend">
                        <span v-for="d in donutLegend" :key="d.label">
                            <i class="dot" :style="{ background: d.color }"></i>{{ d.label }}
                        </span>
                    </div>
                </div>
                <div class="chart-wrap">
                    <canvas ref="donutChart"></canvas>
                </div>
                <div class="consumable-grid">
                    <div class="consumable" v-for="c in consumables" :key="c.label">
                        <div class="label">{{ c.label }}</div>
                        <div class="bar">
                            <div class="fill" :style="{ width: c.level + '%' }"></div>
                        </div>
                        <div class="pct">{{ c.level }}%</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Events / Alerts -->
        <section class="grid bottom-grid">
            <div class="card">
                <div class="card-header">
                    <h3>Recent Events</h3>
                    <button class="chip ghost" @click="ackAll">Acknowledge All</button>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Type</th>
                                <th>Detail</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="e in events" :key="e.time + e.type">
                                <td>{{ e.time }}</td>
                                <td><span class="pill" :class="e.sev">{{ e.type }}</span></td>
                                <td>{{ e.detail }}</td>
                                <td>
                                    <span class="status-pill" :class="{ ack: e.ack }">{{ e.ack ? 'Acknowledged' : 'Open'
                                        }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card tips">
                <div class="card-header">
                    <h3>Cleaning Checklist</h3>
                </div>
                <ul class="checklist">
                    <li v-for="t in checklist" :key="t">{{ t }}</li>
                </ul>
                <button class="btn" @click="markCleaned">Mark as Cleaned</button>
                <small class="muted">Last cleaned: {{ lastCleaned }}</small>
            </div>
        </section>
    </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref, reactive } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default {
    name: 'SmartToilet',
    setup() {
        const lastUpdated = new Date().toLocaleString()
        const statusText = 'Normal'
        const statusColor = 'ok' // ok | warn | crit

        const kpis = reactive([
            { label: 'Occupancy', value: 3, unit: '/ 6', sub: 'stalls occupied', icon: 'fas fa-user-friends', bg: '#2563eb' },
            { label: 'Water Usage', value: 182, unit: 'L', sub: 'today', icon: 'fas fa-tint', bg: '#059669' },
            { label: 'Temp', value: 24.8, unit: '°C', sub: 'comfortable', icon: 'fas fa-thermometer-half', bg: '#ea580c' },
            { label: 'Humidity', value: 56, unit: '%', sub: 'within range', icon: 'fas fa-water', bg: '#7c3aed' },
            { label: 'Ammonia', value: 0.18, unit: 'ppm', sub: 'low', icon: 'fas fa-wind', bg: '#64748b' },
            { label: 'Cleaner ETA', value: '—', unit: '', sub: 'no request', icon: 'fas fa-broom', bg: '#0ea5e9' }
        ])

        const consumables = reactive([
            { label: 'Hand Soap', level: 72 },
            { label: 'Paper Towels', level: 58 },
            { label: 'Toilet Paper', level: 64 },
            { label: 'Air Freshener', level: 40 }
        ])

        const donutLegend = [
            { label: 'Soap', color: '#22c55e' },
            { label: 'Paper Towels', color: '#3b82f6' },
            { label: 'Toilet Paper', color: '#f59e0b' },
            { label: 'Air Freshener', color: '#ef4444' }
        ]

        const period = ref('1D')
        const flowChart = ref(null)
        const donutChart = ref(null)
        let flowChartInstance = null
        let donutChartInstance = null

        const flowDataByPeriod = {
            '1D': {
                labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
                data: [6.2, 5.0, 7.4, 6.1, 8.3, 5.9, 7.9, 6.7, 5.5]
            },
            '1W': {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: [185, 212, 198, 230, 251, 160, 140]
            },
            '1M': {
                labels: Array.from({ length: 12 }, (_, i) => `W${i + 1}`),
                data: [760, 820, 790, 860, 910, 870, 940, 960, 980, 920, 890, 915]
            }
        }

        const buildFlowChart = () => {
            const ctx = flowChart.value.getContext('2d')
            const { labels, data } = flowDataByPeriod[period.value]
            if (flowChartInstance) flowChartInstance.destroy()
            flowChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Flow',
                        data,
                        tension: 0.35,
                        borderWidth: 2,
                        pointRadius: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.06)' } },
                        y: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.06)' }, beginAtZero: true }
                    },
                    plugins: {
                        legend: { labels: { color: '#e5e7eb' } },
                        tooltip: { mode: 'index', intersect: false }
                    }
                }
            })
        }

        const buildDonut = () => {
            const ctx = donutChart.value.getContext('2d')
            if (donutChartInstance) donutChartInstance.destroy()
            donutChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: consumables.map(c => c.label),
                    datasets: [{
                        data: consumables.map(c => c.level),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed}%` } }
                    },
                    cutout: '64%',
                }
            })
        }

        const setPeriod = (p) => {
            period.value = p
            buildFlowChart()
        }

        // events list
        const events = reactive([
            { time: '14:21', type: 'Odor', detail: 'Ammonia spike detected (0.45 ppm)', sev: 'warn', ack: false },
            { time: '12:03', type: 'Usage', detail: 'Peak flow 9.2 L/min', sev: 'ok', ack: true },
            { time: '10:47', type: 'Cleaner', detail: 'Routine spot clean completed', sev: 'ok', ack: true },
            { time: '09:12', type: 'Consumable', detail: 'Air freshener at 35%', sev: 'warn', ack: false }
        ])

        const checklist = [
            'Mirrors & sinks wiped',
            'Floors mopped',
            'Bins emptied',
            'Toilet bowls disinfected',
            'Refill paper & soap',
            'Air freshener replaced'
        ]

        const lastCleaned = ref('Today • 10:45')

        const ackAll = () => {
            events.forEach(e => e.ack = true)
        }
        const markCleaned = () => {
            lastCleaned.value = `${new Date().toLocaleDateString()} • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        }

        onMounted(() => {
            buildFlowChart()
            buildDonut()
            window.addEventListener('resize', resizeCharts)
        })

        const resizeCharts = () => {
            // Chart.js handles responsiveness automatically, but ensure layout updates:
            flowChartInstance && flowChartInstance.resize()
            donutChartInstance && donutChartInstance.resize()
        }

        onBeforeUnmount(() => {
            window.removeEventListener('resize', resizeCharts)
            flowChartInstance && flowChartInstance.destroy()
            donutChartInstance && donutChartInstance.destroy()
        })

        return {
            lastUpdated, statusText, statusColor,
            kpis, consumables, donutLegend,
            period, setPeriod,
            flowChart, donutChart,
            events, ackAll, checklist, markCleaned, lastCleaned
        }
    }
}
</script>

<style scoped>
:root {
    --bg: #0b1220;
    --card: #111a2e;
    --ink: #e5e7eb;
    --muted: #9ca3af;
    --line: rgba(255, 255, 255, 0.06);
    --accent: #22c55e;
}

.toilet-page {
    background: var(--bg);
    min-height: 100vh;
    color: var(--ink);
    padding: 20px;
    box-sizing: border-box;
    display: grid;
    gap: 16px;
}

/* Header */
.page-header {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    align-items: start;
}

.title-wrap h1 {
    margin: 6px 0 2px;
    font-size: 1.3rem;
}

.subtitle {
    color: var(--muted);
    margin: 0;
    font-size: .9rem;
}

.badge {
    display: inline-block;
    background: rgba(34, 197, 94, .15);
    color: #86efac;
    font-size: .75rem;
    padding: 4px 8px;
    border-radius: 999px;
}

.right-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
}

.meta-chip {
    background: var(--card);
    border: 1px solid var(--line);
    padding: 8px 10px;
    border-radius: 10px;
    font-size: .85rem;
    display: flex;
    align-items: center;
    gap: 8px;
}

.meta-chip .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    display: inline-block;
}

.ok {
    background: #22c55e
}

.warn {
    background: #f59e0b
}

.crit {
    background: #ef4444
}

/* Grid helpers */
.grid {
    display: grid;
    gap: 16px;
}

.kpi-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
}

.charts-grid {
    grid-template-columns: 2fr 1.3fr;
}

.bottom-grid {
    grid-template-columns: 2fr 1fr;
}

/* Cards */
.card {
    background: var(--card);
    border: 1px solid var(--line);
    border-radius: 14px;
    padding: 14px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.card-header h3 {
    margin: 0;
    font-size: 1rem;
}

.actions .chip {
    margin-left: 6px;
}

/* KPI */
.kpi {
    position: relative;
}

.kpi-top {
    display: flex;
    align-items: center;
    gap: 10px;
}

.kpi-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    color: #fff;
}

.kpi-label {
    color: var(--muted);
    font-size: .85rem;
}

.kpi-value {
    font-size: 1.45rem;
    font-weight: 700;
    margin-top: 4px;
}

.kpi-value small {
    font-weight: 500;
    color: var(--muted);
    margin-left: 2px;
}

.kpi-sub {
    color: var(--muted);
    font-size: .8rem;
    margin-top: 2px;
}

/* Charts */
.chart-card .chart-wrap {
    height: 280px;
}

.legend {
    display: flex;
    gap: 12px;
    color: var(--muted);
    font-size: .85rem;
}

.legend .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    display: inline-block;
    margin-right: 6px;
}

/* Donut + bars */
.consumable-grid {
    margin-top: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.consumable .label {
    color: var(--muted);
    font-size: .85rem;
    margin-bottom: 6px;
}

.consumable .bar {
    height: 8px;
    background: #0f172a;
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid var(--line);
}

.consumable .fill {
    height: 100%;
    background: linear-gradient(90deg, #22c55e, #16a34a);
}

.consumable .pct {
    font-size: .8rem;
    color: var(--muted);
    margin-top: 4px;
}

/* Table */
.table-wrap {
    overflow: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    text-align: left;
    padding: 10px;
    border-bottom: 1px solid var(--line);
}

th {
    color: var(--muted);
    font-weight: 600;
}

.pill {
    font-size: .75rem;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .06);
    border: 1px solid var(--line);
}

.pill.ok {
    color: #86efac;
    border-color: rgba(34, 197, 94, .35)
}

.pill.warn {
    color: #fde68a;
    border-color: rgba(245, 158, 11, .35)
}

/* Buttons / chips */
.chip {
    font-size: .8rem;
    color: var(--ink);
    background: lightgrey;
    border: 1px solid var(--line);
    padding: 6px 10px;
    border-radius: 999px;
    cursor: pointer;
}

.chip.active {
    background: lightblue;
}

.chip.ghost {
    background: transparent;
}

.btn {
    background: #2563eb;
    border: none;
    color: white;
    border-radius: 10px;
    padding: 10px 14px;
    cursor: pointer;
    margin-top: 8px;
}

.muted {
    color: var(--muted);
    display: block;
    margin-top: 8px;
}

/* Responsive */
@media (max-width: 1100px) {
    .kpi-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .charts-grid {
        grid-template-columns: 1fr;
    }

    .bottom-grid {
        grid-template-columns: 1fr;
    }

    .chart-card .chart-wrap {
        height: 260px;
    }
}

@media (max-width: 640px) {
    .kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .chart-card .chart-wrap {
        height: 240px;
    }

    .consumable-grid {
        grid-template-columns: 1fr;
    }
}
</style>
