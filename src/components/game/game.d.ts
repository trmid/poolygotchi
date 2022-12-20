export interface UIComponent {
  type: 'button'
}

export interface UIButton extends UIComponent {
  type: 'button'
  name: string
  action: () => any
}

export interface DeviceButton {
  title: string
  class: string
  action: () => any
}

export interface DeviceButtons {
  left: DeviceButton
  middle: DeviceButton
  right: DeviceButton
}