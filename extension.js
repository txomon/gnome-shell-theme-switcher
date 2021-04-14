/* 	Theme Switcher
	GNOME Shell extension
	(c) Javier Domingo Cansino 2021
	(Before was) Adawaite Theme Switcher
	(c) Francois Thirioux 2020
	License: GPLv3 	*/


const { Gio, GObject, St } = imports.gi;

const Ce = imports.misc.extensionUtils.getCurrentExtension();

function getTheme (kind) {
	let GioSSS = Gio.SettingsSchemaSource;
	let schemaSource = GioSSS.new_from_directory(Ce.dir.get_child("schemas").get_path(), GioSSS.get_default(), false);
	let schemaObj = schemaSource.lookup('org.gnome.shell.extensions.theme-switcher', true);
	if (!schemaObj) {
		throw new Error('cannot find schemas');
	}
	settings = new Gio.Settings({ settings_schema : schemaObj });
	return settings.get_string(kind)
}


const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

var LIGHT_THEME_SETTING_NAME = 'light-theme';
var DARK_THEME_SETTING_NAME = 'dark-theme';
var LIGHT_THEME_ICON = 'daytime-sunset-symbolic';
var DARK_THEME_ICON = 'daytime-sunrise-symbolic';


var ThemeIndicator = GObject.registerClass(
class ThemeIndicator extends PanelMenu.Button {
	_init() {
		super._init(0.0, 'Theme Switcher');

		this.hbox = new St.BoxLayout({ style_class: 'panel-button', visible: true, reactive: true, can_focus: true, track_hover: true });
		this.icon = new St.Icon({ icon_name: 'dialog-warning-symbolic', style_class: 'system-status-icon' });

		this.schema = Gio.Settings.new('org.gnome.desktop.interface');
		switch (this.schema.get_string('gtk-theme')) {
			case getTheme(LIGHT_THEME_SETTING_NAME):
				this.icon.icon_name = LIGHT_THEME_ICON;
			break;
			case getTheme(DARK_THEME_SETTING_NAME):
				this.icon.icon_name = DARK_THEME_ICON;
			break;
			default:
				Main.notify("Not light/dark mapped theme in use, waiting for a toggle.");
		};

		this.hbox.add_child(this.icon);
		this.add_child(this.hbox);
		this.click = this.connect("button-press-event", this._toggle_theme.bind(this));
	}

	_toggle_theme() {
		switch (this.schema.get_string('gtk-theme')) {
			case LIGHT_THEME_SETTING_NAME:
				this.schema.set_string("gtk-theme", DARK_THEME_SETTING_NAME);
				this.icon.icon_name = DARK_THEME_ICON;
			break;
			// If theme is dark or unknown, switch to light theme
			default:
				this.schema.set_string("gtk-theme", LIGHT_THEME_SETTING_NAME);
				this.icon.icon_name = LIGHT_THEME_ICON;
		};
	}

	_destroy() {
		this.disconnect(this.click);
		super.destroy();
	}
});

class Extension {
    constructor() {
    }

    enable() {
		this._theme_indicator = new ThemeIndicator();
		Main.panel.addToStatusArea('theme-indicator', this._theme_indicator);
    }

    disable() {
    	this._theme_indicator._destroy();
    }
}

function init() {
	return new Extension();
}
