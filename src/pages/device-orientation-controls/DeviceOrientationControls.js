import { Euler, EventDispatcher, MathUtils, Quaternion, Vector3 } from 'three'

/**
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

const DeviceOrientationControls = function (object) {
  const scope = this
  const changeEvent = { type: 'change' }
  const EPS = 0.000001

  this.object = object
  this.object.rotation.reorder('YXZ')

  this.enabled = true

  this.deviceOrientation = {}
  this.screenOrientation = 0

  this.alphaOffset = 0 // radians

  const onDeviceOrientationChangeEvent = function (event) {
    scope.deviceOrientation = event
  }

  const onScreenOrientationChangeEvent = function () {
    scope.screenOrientation = window.orientation || 0
  }

  // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

  const setObjectQuaternion = (function () {
    const zee = new Vector3(0, 0, 1)

    const euler = new Euler()

    const q0 = new Quaternion()

    const q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)) // - PI/2 around the x-axis

    return function (quaternion, alpha, beta, gamma, orient) {
      euler.set(beta, alpha, -gamma, 'YXZ') // 'ZXY' for the device, but 'YXZ' for us

      quaternion.setFromEuler(euler) // orient the device

      quaternion.multiply(q1) // camera looks out the back of the device, not the top

      quaternion.multiply(q0.setFromAxisAngle(zee, -orient)) // adjust for screen orientation
    }
  })()

  this.connect = function () {
    onScreenOrientationChangeEvent() // run once on load

    // iOS 13+

    if (
      window.DeviceOrientationEvent !== undefined &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function'
    ) {
      window.DeviceOrientationEvent.requestPermission()
        .then(function (response) {
          if (response == 'granted') {
            window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false)
            window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false)
          }
        })
        .catch(function (error) {
          console.error(
            'THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:',
            error
          )
        })
    } else {
      window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false)
      window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false)
    }

    scope.enabled = true
  }

  this.disconnect = function () {
    window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false)
    window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false)

    scope.enabled = false
  }

  this.update = (function () {
    const lastQuaternion = new Quaternion()

    return function () {
      if (scope.enabled === false) return

      const device = scope.deviceOrientation

      if (device) {
        const alpha = device.alpha ? MathUtils.degToRad(device.alpha) + scope.alphaOffset : 0 // Z

        const beta = device.beta ? MathUtils.degToRad(device.beta) : 0 // X'

        const gamma = device.gamma ? MathUtils.degToRad(device.gamma) : 0 // Y''

        const orient = scope.screenOrientation ? MathUtils.degToRad(scope.screenOrientation) : 0 // O

        setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient)

        if (8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
          lastQuaternion.copy(scope.object.quaternion)
          scope.dispatchEvent(changeEvent)
        }
      }
    }
  })()

  this.dispose = function () {
    scope.disconnect()
  }

  this.connect()
}

DeviceOrientationControls.prototype = Object.create(EventDispatcher.prototype)
DeviceOrientationControls.prototype.constructor = DeviceOrientationControls

export { DeviceOrientationControls }
