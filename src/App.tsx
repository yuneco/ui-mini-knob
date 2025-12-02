import { useState } from 'react'
import { Knob } from './components/knob/Knob'
import { Slider } from './components/slider/Slider'
import { Toggle } from './components/Toggle'

function App() {
  const [showKnob, setShowKnob] = useState(true)
  const [isCenter, setIsCenter] = useState(true)
  const [value1, setValue1] = useState(0)
  const [value2, setValue2] = useState(0)
  const [value3, setValue3] = useState(0)
  const [sliderValue1, setSliderValue1] = useState(0)
  const [sliderValue2, setSliderValue2] = useState(0)
  const [sliderValue3, setSliderValue3] = useState(0)

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Toggle switches - 左上に配置 */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          display: 'flex',
          gap: '16px',
        }}
      >
        <Toggle
          value={isCenter}
          onChange={setIsCenter}
          leftLabel="Center"
          rightLabel="Edge"
        />
        <Toggle
          value={showKnob}
          onChange={setShowKnob}
          leftLabel="Knob"
          rightLabel="Slider"
        />
      </div>

      {showKnob ? (
        isCenter ? (
          // Knob - Center: 横3列
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '40px',
            }}
          >
            <Knob value={value1} min={0} max={10} step={0.01} onChange={setValue1} />
            <Knob value={value2} min={0} max={100} step={0.1} onChange={setValue2} />
            <Knob value={value3} min={0} max={300} step={1} onChange={setValue3} />
          </div>
        ) : (
          // Knob - Edge: 画面の端に配置
          <>
            {/* Knob 1: 画面上中央 */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                left: '50%',
              }}
            >
              <Knob value={value1} min={0} max={10} step={0.01} onChange={setValue1} />
            </div>

            {/* Knob 2: 画面左下 */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                left: '40px',
              }}
            >
              <Knob value={value2} min={0} max={100} step={0.1} onChange={setValue2} />
            </div>

            {/* Knob 3: 画面右下 */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
              }}
            >
              <Knob value={value3} min={0} max={300} step={1} onChange={setValue3} />
            </div>
          </>
        )
      ) : isCenter ? (
        // Slider - Center: 中央に横並び
        <div
          style={{
            display: 'flex',
            gap: '60px',
          }}
        >
          <Slider
            value={sliderValue1}
            min={0}
            max={10}
            step={0.01}
            onChange={setSliderValue1}
          />
          <Slider
            value={sliderValue2}
            min={0}
            max={100}
            step={0.1}
            onChange={setSliderValue2}
          />
          <Slider
            value={sliderValue3}
            min={0}
            max={300}
            step={1}
            onChange={setSliderValue3}
          />
        </div>
      ) : (
        // Slider - Edge: 画面の端に配置
        <>
          {/* Slider 1: 画面上中央 */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
            }}
          >
            <Slider
              value={sliderValue1}
              min={0}
              max={10}
              step={0.01}
              onChange={setSliderValue1}
            />
          </div>

          {/* Slider 2: 画面左下 */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '240px',
            }}
          >
            <Slider
              value={sliderValue2}
              min={0}
              max={100}
              step={0.1}
              onChange={setSliderValue2}
            />
          </div>

          {/* Slider 3: 画面右下 */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
            }}
          >
            <Slider
              value={sliderValue3}
              min={0}
              max={300}
              step={1}
              onChange={setSliderValue3}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default App
