import { useState } from 'react'
import { Knob } from './components/knob/Knob'
import { Slider } from './components/slider/Slider'

function App() {
  const [value1, setValue1] = useState(0)
  const [value2, setValue2] = useState(0)
  const [value3, setValue3] = useState(0)
  const [value4, setValue4] = useState(0)
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '40px',
        }}
      >
        <Knob value={value1} min={0} max={10} step={0.01} onChange={setValue1} />
        <Knob value={value2} min={0} max={100} step={0.1} onChange={setValue2} />
        <Knob value={value3} min={0} max={300} step={1} onChange={setValue3} />
        <Knob value={value4} min={0} max={1000} step={0.1} onChange={setValue4} />
      </div>
      
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
    </div>
  )
}

export default App
