const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const log = require("../../util/log");
const cast = require("../../util/cast");
const formatMessage = require("format-message");
const BLE = require("../../io/ble");
const Base64Util = require("../../util/base64-util");

/**
 * Icon png to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI =
    "data:image/png;base64,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MS0wN1QxODoxMTo0NCswMDowMI4cSnYAAAARdEVYdGV4aWY6Q29sb3JTcGFjZQAxD5sCSQAAACF0RVh0ZXhpZjpEYXRlVGltZQAyMDIzOjAxOjA1IDEzOjAxOjIxj7MrWQAAABN0RVh0ZXhpZjpFeGlmT2Zmc2V0ADE2NMx7KxQAAAAYdEVYdGV4aWY6UGl4ZWxYRGltZW5zaW9uADEwMEYyQG0AAAAYdEVYdGV4aWY6UGl4ZWxZRGltZW5zaW9uADEwMNs9oRsAAAArdEVYdGV4aWY6U29mdHdhcmUAQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cynnqcc7AAAAHHRFWHRleGlmOnRodW1ibmFpbDpDb21wcmVzc2lvbgA2+WVwVwAAACh0RVh0ZXhpZjp0aHVtYm5haWw6SlBFR0ludGVyY2hhbmdlRm9ybWF0ADMwMkUkal0AAAAvdEVYdGV4aWY6dGh1bWJuYWlsOkpQRUdJbnRlcmNoYW5nZUZvcm1hdExlbmd0aAAzMzA1kELHxgAAAB90RVh0ZXhpZjp0aHVtYm5haWw6UmVzb2x1dGlvblVuaXQAMiVAXtMAAAAfdEVYdGV4aWY6dGh1bWJuYWlsOlhSZXNvbHV0aW9uADcyLzHahxgsAAAAH3RFWHRleGlmOnRodW1ibmFpbDpZUmVzb2x1dGlvbgA3Mi8xdO+JvQAAADh0RVh0aWNjOmNvcHlyaWdodABDb3B5cmlnaHQgKGMpIDE5OTggSGV3bGV0dC1QYWNrYXJkIENvbXBhbnn5V3k3AAAAIXRFWHRpY2M6ZGVzY3JpcHRpb24Ac1JHQiBJRUM2MTk2Ni0yLjFXrdpHAAAAJnRFWHRpY2M6bWFudWZhY3R1cmVyAElFQyBodHRwOi8vd3d3LmllYy5jaBx/AEwAAAA3dEVYdGljYzptb2RlbABJRUMgNjE5NjYtMi4xIERlZmF1bHQgUkdCIGNvbG91ciBzcGFjZSAtIHNSR0JEU0ipAAAAAW9yTlQBz6J3mgAAC0xJREFUaN7tWvt72+QV/i6yHXLBaRdLX02sqyNrLcVWpcRxMJ7JSLR6sKmCYhaWhLTxRlhLxyhqKKzb0oRCMko77mXABgy2sXEZW9fd2f1++ZN25MZOapcfrPATT0+e9En12Hp17u85nxDChHKYYrouBH5AEG0K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";
/**
 * Enum for micro:bit BLE command protocol.
 * https://github.com/scratchfoundation/scratch-microbit-firmware/blob/master/protocol.md
 * @readonly
 * @enum {number}
 */
const BLECommand = {
    CMD_PIN_CONFIG: 0x80,
    CMD_DISPLAY_TEXT: 0x81,
    CMD_DISPLAY_LED: 0x82,
};

/**
 * A time interval to wait (in milliseconds) before reporting to the BLE socket
 * that data has stopped coming from the peripheral.
 */
const BLETimeout = 4500;

/**
 * A time interval to wait (in milliseconds) while a block that sends a BLE message is running.
 * @type {number}
 */
const BLESendInterval = 100;

/**
 * A string to report to the BLE socket when the micro:bit has stopped receiving data.
 * @type {string}
 */
const BLEDataStoppedError = "datalogger extension stopped receiving data";

/**
 * Enum for micro:bit protocol.
 * https://github.com/scratchfoundation/scratch-microbit-firmware/blob/master/protocol.md
 * @readonly
 * @enum {string}
 */
const BLEUUID = {
    service: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
    rxChar: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
    txChar: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
};

/**
 * Manage communication with a MicroBit peripheral over a Scrath Link client socket.
 */
class stemeDatalogger {
    /**
     * Construct a MicroBit communication object.
     * @param {Runtime} runtime - the Scratch 3.0 runtime
     * @param {string} extensionId - the id of the extension
     */
    constructor(runtime, extensionId) {
        /**
         * The Scratch 3.0 runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;

        /**
         * The BluetoothLowEnergy connection socket for reading/writing peripheral data.
         * @type {BLE}
         * @private
         */
        this._ble = null;
        this._runtime.registerPeripheralExtension(extensionId, this);

        /**
         * The id of the extension this peripheral belongs to.
         */
        this._extensionId = extensionId;

        /**
         * Interval ID for data reading timeout.
         * @type {number}
         * @private
         */
        this._timeoutID = null;

        /**
         * A flag that is true while we are busy sending data to the BLE socket.
         * @type {boolean}
         * @private
         */
        this._busy = false;

        /**
         * ID for a timeout which is used to clear the busy flag if it has been
         * true for a long time.
         */
        this._busyTimeoutID = null;

        this.reset = this.reset.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
    }

    /**
     * @returns {boolean} - the latest value received for the A button.
     */
    get buttonA() {
        return this._sensors.buttonA;
    }

    /**
     * @returns {boolean} - the latest value received for the B button.
     */
    get buttonB() {
        return this._sensors.buttonB;
    }

    /**
     * Called by the runtime when user wants to scan for a peripheral.
     */
    scan() {
        if (this._ble) {
            this._ble.disconnect();
        }
        this._ble = new BLE(
            this._runtime,
            this._extensionId,
            {
                // filters: [{ services: [BLEUUID.service] }],
                filters: [{ namePrefix: "ESP32_Scratch" }],
                optionalServices: [BLEUUID.service],
            },
            this._onConnect,
            this.reset,
        );
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     */
    connect(id) {
        if (this._ble) {
            this._ble.connectPeripheral(id);
        }
    }

    /**
     * Disconnect from the micro:bit.
     */
    disconnect() {
        if (this._ble) {
            this._ble.disconnect();
        }

        this.reset();
    }

    /**
     * Reset all the state and timeout/interval ids.
     */
    reset() {
        if (this._timeoutID) {
            window.clearTimeout(this._timeoutID);
            this._timeoutID = null;
        }
    }

    /**
     * Return true if connected to the micro:bit.
     * @returns {boolean} - whether the micro:bit is connected.
     */
    isConnected() {
        let connected = false;
        if (this._ble) {
            connected = this._ble.isConnected();
        }
        return connected;
    }

    /**
     * Send a message to the peripheral BLE socket.
     * @param {number} command - the BLE command hex.
     * @param {Uint8Array} message - the message to write
     */
    send(command, message) {
        if (!this.isConnected()) return;
        if (this._busy) return;

        // Set a busy flag so that while we are sending a message and waiting for
        // the response, additional messages are ignored.
        this._busy = true;

        // Set a timeout after which to reset the busy flag. This is used in case
        // a BLE message was sent for which we never received a response, because
        // e.g. the peripheral was turned off after the message was sent. We reset
        // the busy flag after a while so that it is possible to try again later.
        this._busyTimeoutID = window.setTimeout(() => {
            this._busy = false;
        }, 5000);

        const output = new Uint8Array(message.length + 1);
        output[0] = command; // attach command to beginning of message
        for (let i = 0; i < message.length; i++) {
            output[i + 1] = message[i];
        }
        const data = Base64Util.uint8ArrayToBase64(output);

        this._ble
            .write(BLEUUID.service, BLEUUID.txChar, data, "base64", true)
            .then(() => {
                this._busy = false;
                window.clearTimeout(this._busyTimeoutID);
            });
    }

    /**
     * Starts reading data from peripheral after BLE has connected to it.
     * @private
     */
    _onConnect() {
        this._ble.read(BLEUUID.service, BLEUUID.rxChar, true, this._onMessage);
        this._timeoutID = window.setTimeout(
            () => this._ble.handleDisconnectError(BLEDataStoppedError),
            BLETimeout,
        );
    }

    /**
     * Process the sensor data from the incoming BLE characteristic.
     * @param {object} base64 - the incoming BLE data.
     * @private
     */
    _onMessage(base64) {
        // parse data
        const data = Base64Util.base64ToUint8Array(base64);

        //my code here!

        // cancel disconnect timeout and start a new one
        window.clearTimeout(this._timeoutID);
        this._timeoutID = window.setTimeout(
            () => this._ble.handleDisconnectError(BLEDataStoppedError),
            BLETimeout,
        );
    }
}

/**
 * Enum for micro:bit buttons.
 * @readonly
 * @enum {string}
 */
const MicroBitButtons = {
    A: "A",
    B: "B",
    ANY: "any",
};

/**
 * Scratch 3.0 blocks to interact with a MicroBit peripheral.
 */
class Scratch3StemeDataloggerBlocks {
    /**
     * @returns {string} - the name of this extension.
     */
    static get EXTENSION_NAME() {
        return "stemeDatalogger";
    }

    /**
     * @returns {string} - the ID of this extension.
     */
    static get EXTENSION_ID() {
        return "stemeDataloggerID";
    }

    /**
     * @returns {Array} - text and values for each buttons menu element
     */
    get BUTTONS_MENU() {
        return [
            {
                text: "A",
                value: MicroBitButtons.A,
            },
            {
                text: "B",
                value: MicroBitButtons.B,
            },
            {
                text: formatMessage({
                    id: "microbit.buttonsMenu.any",
                    default: "any",
                    description:
                        'label for "any" element in button picker for micro:bit extension',
                }),
                value: MicroBitButtons.ANY,
            },
        ];
    }

    /**
     * Construct a set of MicroBit blocks.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor(runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        // Create a new MicroBit peripheral instance
        this._peripheral = new stemeDatalogger(
            this.runtime,
            Scratch3StemeDataloggerBlocks.EXTENSION_ID,
        );
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: Scratch3StemeDataloggerBlocks.EXTENSION_ID,
            name: Scratch3StemeDataloggerBlocks.EXTENSION_NAME,
            blockIconURI: blockIconURI,
            showStatusButton: true,
            blocks: [
                {
                    opcode: "whenButtonPressed",
                    text: formatMessage({
                        id: "microbit.whenButtonPressed",
                        default: "when [BTN] button pressed",
                        description:
                            "when the selected button on the micro:bit is pressed",
                    }),
                    blockType: BlockType.HAT,
                    arguments: {
                        BTN: {
                            type: ArgumentType.STRING,
                            menu: "buttons",
                            defaultValue: MicroBitButtons.A,
                        },
                    },
                },
            ],
            menus: {
                buttons: {
                    acceptReporters: true,
                    items: this.BUTTONS_MENU,
                },
            },
        };
    }

    /**
     * Test whether the A or B button is pressed
     * @param {object} args - the block's arguments.
     * @returns {boolean} - true if the button is pressed.
     */
    whenButtonPressed(args) {
        return false;
    }
}

module.exports = Scratch3StemeDataloggerBlocks;
