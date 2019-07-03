module.exports = {
    /**
     * Name of the integration which is displayed in the Polarity integrations user interface
     *
     * @type String
     * @required
     */
    name: "Hybrid Analysis",
    /**
     * The acronym that appears in the notification window when information from this integration
     * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
     * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
     * here will be carried forward into the notification window.
     *
     * @type String
     * @required
     */
    acronym: "HA",
    /**
     * Description for this integration which is displayed in the Polarity integrations user interface
     *
     * @type String
     * @optional
     */
    description: "A free malware analysis service for the community that detects and analyzes unknown threats using a unique Hybrid Analysis technology",
    entityTypes: ['hash'],
    /**
     * An array of style files (css or less) that will be included for your integration. Any styles specified in
     * the below files can be used in your custom template.
     *
     * @type Array
     * @optional
     */
    "styles": [
        "./styles/ha.less",
    ],
    /**
     * Provide custom component logic and template for rendering the integration details block.  If you do not
     * provide a custom template and/or component then the integration will display data as a table of key value
     * pairs.
     *
     * @type Object
     * @optional
     */
    block: {
        component: {
            file: "./components/ha-block.js"
        },
        template: {
            file: "./templates/ha-block.hbs"
        }
    },
    summary: {
        component: {
            file: "./components/ha-summary.js"
        },
        template: {
            file: "./templates/ha-summary.hbs"
        }
    },
    request: {
        // Provide the path to your certFile. Leave an empty string to ignore this option.
        // Relative paths are relative to the HA integration's root directory
        cert: '',
        // Provide the path to your private key. Leave an empty string to ignore this option.
        // Relative paths are relative to the HA integration's root directory
        key: '',
        // Provide the key passphrase if required.  Leave an empty string to ignore this option.
        // Relative paths are relative to the HA integration's root directory
        passphrase: '',
        // Provide the Certificate Authority. Leave an empty string to ignore this option.
        // Relative paths are relative to the HA integration's root directory
        ca: '',
        // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
        // the url parameter (by embedding the auth info in the uri)
        proxy: ''
    },
    logging: {
        level: 'info',  //trace, debug, info, warn, error, fatal
    },
    /**
     * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
     * as an array of option objects.
     *
     * @type Array
     * @optional
     */
    "options": [
        {
            "key": "url",
            "name": "Hybrid Analysis URL",
            "description": "Base URL for Hybrid Analysis Service",
            "default": "https://www.hybrid-analysis.com",
            "type": "text",
            "userCanEdit": false,
            "adminOnly": true
        },
        {
            "key": "apiKey",
            "name": "API Key",
            "description": "Hybrid Analysis API Key",
            "default": "",
            "type": "text",
            "userCanEdit": true,
            "adminOnly": false
        },
        {
      key: "minScore",
      name: "Minimum Threat Score",
      description:
        "Minimum threat score to display in the Polarity overlay window (Scale of 1-100)",
      default: 50,
      type: "number",
      userCanEdit: true,
      adminOnly: false
    }
    ]
};
