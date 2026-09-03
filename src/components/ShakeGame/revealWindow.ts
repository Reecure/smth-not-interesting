import { CRATE_NEW_TYPE } from './dnd.ts'

const WIDTH = 460
const HEIGHT = 560

const waitingHtml = () => `<!doctype html><html><head><meta charset="utf-8" />
<style>
  html,body{margin:0;height:100%;background:#0B0620;color:#9B8FCF;font-family:system-ui,sans-serif;display:grid;place-items:center}
  p{font-size:14px;letter-spacing:1px}
</style></head><body><p>ждём скан QR...</p></body></html>`

const engineHtml = (crateCount: number, code: string) => `<!doctype html><html><head><meta charset="utf-8" />
<script src="https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@microsoft/signalr@10.0.11/dist/browser/signalr.min.js"></script>
<style>
  html,body{margin:0;height:100%;background:#0B0620;overflow:hidden;font-family:system-ui,sans-serif;color:#E9E4FF}
  #stage{position:relative;width:100%;height:100%}
  #head{position:absolute;top:0;left:0;right:0;padding:16px 20px;z-index:2;text-align:center}
  #title{font-size:22px;font-weight:700;letter-spacing:1px;margin:0 0 10px}
  #bar{height:10px;background:#150E33;border-radius:6px;overflow:hidden;border:1px solid #2A1D5E}
  #bar-fill{height:100%;width:0%;background:linear-gradient(90deg,#8B5CF6,#A78BFA)}
  #stats{margin-top:6px;font-size:12px;color:#9B8FCF}
  .crate{position:absolute;width:48px;height:48px;background:linear-gradient(160deg,#A78BFA,#8B5CF6);border:3px solid #E9E4FF;border-radius:50%;cursor:grab;display:flex;align-items:center;justify-content:center;font-size:26px}
  .crate:active{cursor:grabbing}
</style></head>
<body>
  <div id="head">
    <h1 id="title">тряси телефон, скобочка</h1>
    <div id="bar"><div id="bar-fill"></div></div>
    <div id="stats">0%</div>
  </div>
  <div id="stage"></div>
  <script>
    var Engine = Matter.Engine, World = Matter.World, Bodies = Matter.Bodies, Body = Matter.Body
    var engine = Engine.create()
    engine.gravity.y = 1
    var w = window.innerWidth
    var h = window.innerHeight
    var ground = Bodies.rectangle(w / 2, h + 20, w * 2, 40, { isStatic: true })
    var wallL = Bodies.rectangle(-20, h / 2, 40, h * 2, { isStatic: true })
    var wallR = Bodies.rectangle(w + 20, h / 2, 40, h * 2, { isStatic: true })
    World.add(engine.world, [ground, wallL, wallR])

    var corners = [
      { x: 40, y: -60 },
      { x: w - 40, y: -60 },
      { x: 40, y: -220 },
      { x: w - 40, y: -220 }
    ]
    var bodies = []
    var els = []
    var stage = document.getElementById('stage')

    function spawnCrate(index) {
      var corner = corners[index % corners.length]
      var x = corner.x + (Math.random() - 0.5) * 20
      var y = corner.y - Math.random() * 60
      var vx = (w / 2 - corner.x) * 0.01
      var body = Bodies.rectangle(x, y, 48, 48, { restitution: 0.35, friction: 0.4 })
      Body.setVelocity(body, { x: vx, y: 0 })
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2)
      World.add(engine.world, body)
      bodies.push(body)

      var el = document.createElement('div')
      el.className = 'crate'
      el.textContent = '🦆'
      el.id = 'crate-' + index
      el.draggable = true
      el.dataset.index = String(bodies.length - 1)
      el.addEventListener('dragstart', function (e) {
        var idx = Number(e.target.dataset.index)
        e.dataTransfer.setData('${CRATE_NEW_TYPE}', e.target.id)
        e.dataTransfer.effectAllowed = 'move'
        World.remove(engine.world, bodies[idx])
      })
      stage.appendChild(el)
      els.push(el)
    }

    ;(function physicsLoop() {
      Engine.update(engine, 1000 / 60)
      for (var i = 0; i < bodies.length; i++) {
        var el = els[i]
        if (!el.isConnected) continue
        var b = bodies[i]
        el.style.transform = 'translate(' + (b.position.x - 24) + 'px,' + (b.position.y - 24) + 'px) rotate(' + b.angle + 'rad)'
      }
      requestAnimationFrame(physicsLoop)
    })()

    var TARGET = 100
    var GAIN = 0.045
    var DECAY_PER_SEC = 4
    var AMP_GAIN = 0.4
    var AMP_MAX = 26
    var AMP_DECAY_PER_SEC = 0.06
    var CRATE_COUNT = ${crateCount}
    var STEP = TARGET / CRATE_COUNT

    var progress = 0
    var amp = 0
    var peak = 0
    var spawnedCount = 0
    var eventCount = 0

    var titleEl = document.getElementById('title')
    var barFillEl = document.getElementById('bar-fill')
    var statsEl = document.getElementById('stats')

    var hubUrl = window.opener.location.origin + '/hub/shake'
    var connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { headers: { 'bypass-tunnel-reminder': 'true' } })
      .withAutomaticReconnect([0, 1000, 3000, 5000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connection.on('shake', function (force) {
      eventCount += 1
      var f = Math.min(force, 80)
      amp = Math.min(AMP_MAX, amp + f * AMP_GAIN)
      progress = Math.min(TARGET, progress + f * GAIN)
      peak = Math.max(peak, Math.round(force))

      var shouldHaveSpawned = Math.min(CRATE_COUNT, Math.floor(progress / STEP))
      while (spawnedCount < shouldHaveSpawned) {
        spawnCrate(spawnedCount)
        spawnedCount += 1
      }

      if (spawnedCount >= CRATE_COUNT) {
        titleEl.textContent = 'тащи уточек в лужицу'
      }
    })

    connection.start().then(function () {
      titleEl.dataset.conn = 'ok'
    }).then(function () {
      return connection.invoke('JoinRoom', '${code}')
    }).catch(function (err) {
      statsEl.textContent = 'ошибка подключения: ' + err
    })

    connection.onreconnecting(function () {
      statsEl.textContent = 'переподключение...'
    })

    var lastTick = performance.now()
    ;(function progressLoop(now) {
      var dt = (now - lastTick) / 1000
      lastTick = now

      amp = Math.max(0, amp - amp * AMP_DECAY_PER_SEC * 60 * dt)
      if (spawnedCount < CRATE_COUNT) {
        progress = Math.max(0, progress - DECAY_PER_SEC * dt)
      }

      barFillEl.style.width = progress + '%'
      statsEl.textContent = Math.round(progress) + '% · пик '
      titleEl.style.filter = amp > 4 ? 'blur(' + ((amp - 4) * 0.12) + 'px)' : 'none'

      requestAnimationFrame(progressLoop)
    })(lastTick)
  </script>
</body></html>`

export function openRevealWindow(): Window | null {
    const left = Math.max(0, window.screen.availWidth - WIDTH - 20)
    const top = Math.max(0, (window.screen.availHeight - HEIGHT) / 2)
    const w = window.open('about:blank', 'reveal', `width=${WIDTH},height=${HEIGHT},left=${left},top=${top}`)
    if (!w) return null
    w.document.open()
    w.document.write(waitingHtml())
    w.document.close()
    return w
}

export function startGameInWindow(w: Window, crateCount: number, code: string) {
    if (w.closed) return
    w.document.open()
    w.document.write(engineHtml(crateCount, code))
    w.document.close()
}

export function removeCrate(w: Window | null, crateId: string) {
    if (!w || w.closed) return
    w.document.getElementById(crateId)?.remove()
}