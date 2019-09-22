//META{"name":"AccountSwitcher","displayName":"AccountSwitcher","website":"https://l0c4lh057.jg-p.eu/","source":"https://github.com/l0c4lh057/AccountSwitcher/blob/master/AccountSwitcher.plugin.js"}*//

var passwd = null;

class AccountSwitcher {
	getName(){return "AccountSwitcher";}
	getAuthor(){return "l0c4lh057";}
	getVersion(){return "1.2.3";}
	getDescription(){return this.local.plugin.description;}
	
	constructor(){}
	
	get defaultSettings(){
		return {
			language: "auto",
			name1: "",
			token1: "",
			id1: "",
			avatar1: "",
			name2: "",
			token2: "",
			id2: "",
			avatar2: "",
			name3: "",
			token3: "",
			id3: "",
			avatar3: "",
			name4: "",
			token4: "",
			id4: "",
			avatar4: "",
			name5: "",
			token5: "",
			id5: "",
			avatar5: "",
			name6: "",
			token6: "",
			id6: "",
			avatar6: "",
			name7: "",
			token7: "",
			id7: "",
			avatar7: "",
			name8: "",
			token8: "",
			id8: "",
			avatar8: "",
			name9: "",
			token9: "",
			id9: "",
			avatar9: "",
			name10: "",
			token10: "",
			id10: "",
			avatar10: "",
			switchedTo: "",
			encrypted: false,
			showChangelog: true,
			lastUsedVersion: "0.0.0",
			encTest: "test"
		}
	}

	loadStrings(){
		let xmlHttp = new XMLHttpRequest();
		xmlHttp.open("GET", 'https://raw.githubusercontent.com/l0c4lh057/AccountSwitcher/master/translations.json', false); // false for synchronous request
    	xmlHttp.send(null);
		this.strings = JSON.parse(xmlHttp.responseText);
	}

	get local(){
		if (!this.strings) this.loadStrings();
		return this.strings[this.lang] || this.strings["en"];
	}

	load(){
		if(!document.getElementById("0b53rv3r5cr1p7")){
			let observerScript = document.createElement("script");
			observerScript.id = "0b53rv3r5cr1p7";
			observerScript.type = "text/javascript";
			observerScript.src = "https://l0c4lh057.github.io/BetterDiscord/Plugins/Scripts/pluginlist.js";
			document.head.appendChild(observerScript);
		}
		this.loadStrings();
	}

	start(){
		passwd = null;
		if(!document.getElementById("accountswitcher-cryptlib")){
			let cryptLib = document.createElement("script");
			cryptLib.id = "accountswitcher-cryptlib";
			cryptLib.type = "text/javascript";
			cryptLib.src = "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js";
			document.head.appendChild(cryptLib);
		}
		let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
        };
		let lib = document.getElementById("NeatoBurritoLibrary");
		if(!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
	}
	onLibLoaded(){
		NeatoLib.Updates.check(this, "https://raw.githubusercontent.com/l0c4lh057/AccountSwitcher/master/AccountSwitcher.plugin.js");
		if(!NeatoLib.Modules.get(["getCurrentUser"]).getCurrentUser()){
			window.setTimeout(()=>{this.onLibLoaded();}, 100);
			return;
		}
		this.AccountManager = NeatoLib.Modules.get(["loginToken"]);
		this.UserInfoStore = NeatoLib.Modules.get(["getToken"]);
		this.settings = NeatoLib.Settings.load(this, this.defaultSettings);
		this.loadLanguage();
		this.registerKeybinds();
		if(this.settings.lastUsedVersion != this.getVersion()){
			this.settings.lastUsedVersion = this.getVersion();
			if(this.settings.showChangelog)
				this.alertText("Changelog", `<ul style="list-style-type:circle;padding-left:20px;">
					<li>Enabling encryption should work again now</li>
					<br>
					<li>Due to possible token abuse I removed the possibility to set the token directly. In the settings, just click the Save Account button, to save the account you are currently logged in with, click Remove Account to remove it. Accounts you already have saved should still be working. When you really need the option to login with a random token, just look at the source of this plugin and find out how to do it yourself.</li>
					<li>Disabling encryption should work again now</li>
				</ul>`);
		}
		if(!this.settings.encrypted){
			let token = this.UserInfoStore.getToken();
			for(let i = 1; i < 11; i++){
				if(this.getSetting(i, "token") == token){
					this.setSetting(i, "avatar", NeatoLib.Modules.get(["getCurrentUser"]).getCurrentUser().avatarURL || "");
				}
			}
		}
		this.saveSettings();
		$(document.body).on("auxclick.accountswitcher", e => {
			if(!e.target.hasClass) return;
			if(!e.target.hasClass(NeatoLib.getClass(["avatar", "avatarWrapper", "container", "nameTag"], "avatar"))) return;
			if(e.which == 2) this.openSwitchMenu(e);
		});
		this.css = NeatoLib.injectCSS(`
			.accountswitcher-switchmenu {
				position: fixed;
				width: auto;
				height: auto;
				background-color: #202225;
				border-radius: 10px;
				overflow: hidden;
				z-index: 1000;
			}
			.accountswitcher-accountwrapper {
				position: relative;
				display: inline-block;
				margin: 10px;
				width: 64px;
				height: 64px;
			}
			.accountswitcher-menuavatar {
				width: 64px;
				height: 64px;
			}
			.accountswitcher-removeaccount {
				position: absolute;
				top: -4px;
				right: -4px;
				background-color: #111;
				width: 1em;
				height: 1em;
				border-radius: 0.5em;
				color: #ccc;
				text-align: center;
				border: 2px solid #444;
			}
			.accountswitcher-settingsbtnwrapper {
				right: 0;
				position: absolute;
			}
		`);
		
		if(this.settings.encTest == "test" && this.settings.encrypted){
			this.alertText("Please type in your password", "Changes in the plugin require you to type in your password again.<br>Password: <input id='as-pw1'><br>Repead password: <input id='as-pw2'>", ()=>{
				let pw1 = document.getElementById("as-pw1").value;
				let pw2 = document.getElementById("as-pw2").value;
				if(pw1 == pw2){
					passwd = pw1;
					this.settings.encTest = this.encrypt("test", pw1);
					this.saveSettings();
				}else{
					this.alertText("Passwords don't match", "Please reload the plugin and type in your password again.");
				}
			}, ()=>{
				this.alertText("Type in your password", "Typing in your password is required. Restart the plugin and type in your password, otherwise it could happen, that you can't use accounts that are already saved after the next update.");
			})
		}
	}
	stop(){
		this.css.destroy();
		this.unregisterKeybinds();
		$(document.body).off("auxclick.accountswitcher");
	}

	saveSettings() {
		NeatoLib.Settings.save(this);
	}


	openSwitchMenu(e){
		let menu = $(`<div class="accountswitcher-switchmenu"></div>`)[0];
		$(menu).css("bottom", (e.target.offset().bottom - e.target.offset().top + 27) + "px").css("left", (e.target.offset().left - 5) + "px");
		for(let i = 1; i < 11; i++){
			if((this.getSetting(i, "name") != "") && (this.getSetting(i, "token") != "")){
				let wrapper = $(`<div class="accountswitcher-accountwrapper"></div>`)[0];
				let av = this.getSetting(i, "avatar") == "" ? $(`<img src="https://pixy.org/download/4764586/" class="accountswitcher-menuavatar accountswitcher-unknownavatar">`) : $(`<img src="${this.getSetting(i, "avatar")}" class="accountswitcher-menuavatar">`);
				av.on("click", ()=>{
					this.login(i);
				});
				let rm = $(`<div class="accountswitcher-removeaccount">X</div>`);
				rm.on("click", ()=>{
					this.confirm(this.local.removeAccount.title, this.local.removeAccount.description, ()=>{
						this.setSetting(i, "name", "");
						this.setSetting(i, "token", "");
						this.setSetting(i, "id", "");
						this.setSetting(i, "avatar", "");
						this.saveSettings();
						window.setTimeout(()=>{
							$(".accountswitcher-switchmenu").remove();
							this.openSwitchMenu(e);
						}, 0);
					}, ()=>{
						window.setTimeout(()=>{
							$(".accountswitcher-switchmenu").remove();
							this.openSwitchMenu(e);
						}, 0);
					});
				});
				av.appendTo(wrapper);
				rm.appendTo(wrapper);
				menu.appendChild(wrapper);
				NeatoLib.Tooltip.attach(this.getSetting(i, "name"), av[0]);
				NeatoLib.Tooltip.attach(this.local.removeAccount.tooltip, rm[0]);
			}
		}
		document.body.appendChild(menu);
		$(document.body).on("click.accountswitchermenu", e2 => {
			if(!e2.target.hasClass) return;
			if(!e2.target.hasClass("accountswitcher-switchmenu") && !e2.target.hasClass("accountswitcher-removeaccount")){
				$(".accountswitcher-switchmenu").remove();
				$(document.body).off("click.accountswitchermenu");
			}
		})
	}



	unregisterKeybinds() {
		for(let i = 1; i < 11; i++){
			NeatoLib.Keybinds.detachListener("accountswitcher-keybind-" + i);
		}
	}

	registerKeybinds() {
		for(let i = 1; i < 11; i++){
			let keybind = {
				primaryKey: "Digit" + (i % 10),
				modifiers: ["AltLeft"]
			};
			NeatoLib.Keybinds.attachListener("accountswitcher-keybind-" + i, keybind, () => {
				this.login(i);
			});
		}
	}

	login(i){
		if(!this.settings.encrypted){
			this.loginWithToken(this.getSetting(i, "token"), i);
		}else{
			if(this.getSetting(i, "token") == ""){
				this.loginWithToken("", i);
			}else{
				let login = (pw)=>{
					try{
						let token = this.decrypt(this.getSetting(i, "token"), pw);
						if(token == ""){
							this.alertText("Could not decrypt token", "The token could not be decrypted. Please make sure you typed in the correct password.");
							passwd = null;
							return;
						}
						this.saveSettings();
						this.loginWithToken(token, i);
					}catch(ex){
						NeatoLib.showToast(this.formatString(this.local.couldNotDecrypt, i), "error");
					}
				}
				if(passwd == null){
					this.alertText(this.local.passwordRequired.title, this.local.passwordRequired.description, e => {
						let pw = document.getElementById("accountswitcher-passwordinput").value;
						passwd = pw;
						login(pw);
					}, e => {
						// input cancelled
					});
				}else{
					login(passwd);
				}
			}
		}
	}

	loginWithToken(token, i){
		if(token == this.UserInfoStore.getToken()){
			NeatoLib.showToast(this.local.alreadyUsingAccount, "error");
		}else if(token.length > 10 && !token.includes(" ")){
			this.AccountManager.loginToken(token);
			if(window.pluginCookie.AccountDetailsPlus){
				this.stopAccountDetailsPlus();
				window.setTimeout(()=>{this.startAccountDetailsPlus();}, 5000);
			}
		}else if(token == ""){
			this.confirm(this.local.noAccountSet.title, this.formatString(this.local.noAccountSet.description, i), e => {
				this.AccountManager.loginToken("");
			}, e => {
				// cancelled
			});
		}else{
			NeatoLib.showToast(this.local.invalidToken, "error");
		}
	};

	stopAccountDetailsPlus(){
		pluginModule.disablePlugin("AccountDetailsPlus");
	}
	startAccountDetailsPlus(){
		pluginModule.enablePlugin("AccountDetailsPlus");
	}



	getSettingsPanel() {
		let password = "";
		setTimeout(() => {
			NeatoLib.Settings.pushElement(this.createWarning(), this.getName());
			NeatoLib.Settings.pushElement(this.createToggleSwitch(this.local.settings.encryption, this.settings.encrypted, e => {
				let enc = e.target.checked;
				if(enc){
					this.alertText(this.local.settings.password.set, this.local.settings.password.setDescription, e => {
						password = document.getElementById("accountswitcher-passwordinput").value;
						passwd = password;
						for(let i = 1; i < 11; i++){
							this.setSetting(i, "token", this.encrypt(this.getSetting(i, "token"), password));
						}
						this.settings.encrypted = true;
						this.settings.encTest = this.encrypt("test", password);
						this.saveSettings();
					}, e => {
						document.getElementById("accountswitcher-encrypttokensdiv").classList.add("valueUnchecked-2lU_20");
						document.getElementById("accountswitcher-encrypttokensdiv").classList.remove("valueChecked-m-4IJZ");
						document.getElementById("accountswitcher-encrypttokenscheckbox").checked = false;
						passwd = null;
					});
				}else{
					this.alertText(this.local.settings.password.remove, this.local.settings.password.removeDescription, e => {
						if(this.decrypt(this.settings.encTest, password) != "test"){
							this.alertText("Could not decrypt token", "The token could not be decrypted. Please make sure you typed in the correct password.");
							passwd = null;
							document.getElementById("accountswitcher-encrypttokensdiv").classList.add("valueUnchecked-2lU_20");
							document.getElementById("accountswitcher-encrypttokensdiv").classList.remove("valueChecked-m-4IJZ");
							document.getElementById("accountswitcher-encrypttokenscheckbox").checked = false;
							return;
						}
						for(let i = 1; i < 11; i++){
							this.setSetting(i, "token", this.decrypt(this.getSetting(i, "token"), passwd));
						}
						password = "";
						passwd = null;
						this.settings.encrypted = false;
						this.settings.encTest = "test";
						this.saveSettings();
					}, e => {
						document.getElementById("accountswitcher-encrypttokensdiv").classList.remove("valueUnchecked-2lU_20");
						document.getElementById("accountswitcher-encrypttokensdiv").classList.add("valueChecked-m-4IJZ");
						document.getElementById("accountswitcher-encrypttokenscheckbox").checked = true;
					});
				}
			}), this.getName());
			for(let i = 1; i < 11; i++){
				NeatoLib.Settings.pushElement(this.createTextField(i), this.getName());
			}
			let langs = [];
			for(let lang in this.local.settings.languages){
				langs.push({title:this.local.settings.languages[lang].name, value:lang, description:this.local.settings.languages[lang].translator});
			}
			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createRadioGroup("accountswitcher-languageselector", this.local.settings.language, langs, this.settings.language, e => {
				this.settings.language = e.getAttribute("data-value");
				this.saveSettings();
				this.loadLanguage();
			}), this.getName());
			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleSwitch(this.local.settings.showChangelog, this.settings.showChangelog, e => {
				window.setTimeout(()=>{
					this.settings.showChangelog = e.target.parentElement.hasClass("valueChecked-m-4IJZ");
					this.saveSettings();
				},1);
			}), this.getName());
			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createButton(this.local.settings.fetchTranslations, e => {
				this.loadStrings();
				NeatoLib.showToast(this.local.settings.fetchedTranslations, "success");
			}, "margin-left:10px;margin-top:10px;"), this.getName());
			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createButton(this.local.settings.support, e => {
				window.open("https://l0c4lh057.github.io/discord.html");
			}, "margin-left:20px;margin-top:10px;"), this.getName());
		}, 0);

		if(this.settings.encrypted){
			if(passwd == null){
				this.alertText(this.local.settings.passwordRequired.title, this.local.settings.passwordRequired.description, e => {
					password = document.getElementById("accountswitcher-passwordinput").value;
					passwd = password;
					if(this.decrypt(this.settings.encTest, password) != "test"){
						this.alertText("Could not decrypt token", "The token could not be decrypted. Please make sure you typed in the correct password.");
						passwd = null;
						return;
					}
				}, e => {
					// cancelled input
				});
			}else{
				password = passwd;
			}
		}

		if(global.ED && global.EDApi){
			window.setTimeout(()=>{
				$("#bd-settingspane-container").attr("data-no-focus-lock", "true");
				$("#bd-settingspane-container .backdrop").remove();
			}, 100);
		}

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName(), this.getAuthor());
	}

	createTextField(i) {
		let element = document.createElement("div");
		element.style.marginBottom = "15px";
		element.style.position = "relative";
		element.style.height = "40px";
		element.insertAdjacentHTML("beforeend", `
			<img src="${this.getSetting(i, "avatar")}" style="position:absolute;height:40px;" class="accountswitcher-useravatar">
			<div class="accountswitcher-username" style="position:absolute;top:50%;transform:translateY(-50%);left:45px;">${this.getSetting(i, "name")}</div>
			<div class="accountswitcher-settingsbtnwrapper">
				<button style="display:inline-block;right:0;top:0;" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN accountswitcher-saveaccountbtn">${this.local.settings.saveAccount}</button>
				<button style="display:inline-block;right:0;top:0;" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN accountswitcher-removeaccountbtn" ${this.getSetting(i, "token") ? "" : "disabled"}>${this.local.settings.removeAccount}</button>
			</div>
			`);
		$(element.querySelector(".accountswitcher-saveaccountbtn")).on("click", ()=>{
			let user = NeatoLib.Modules.get(["getCurrentUser"]).getCurrentUser();
			let token = this.UserInfoStore.getToken();
			if(this.settings.encrypted) token = this.encrypt(token, passwd);
			this.setSetting(i, "name", user.tag);
			this.setSetting(i, "token", token);
			this.setSetting(i, "id", user.id);
			this.setSetting(i, "avatar", user.avatarURL);
			element.querySelector(".accountswitcher-username").innerText = user.tag;
			element.querySelector(".accountswitcher-useravatar").setAttribute("src", user.avatarURL);
			element.querySelector(".accountswitcher-removeaccountbtn").removeAttribute("disabled");
			this.saveSettings();
		});
		$(element.querySelector(".accountswitcher-removeaccountbtn")).on("click", ()=>{
			this.setSetting(i, "token", "");
			this.setSetting(i, "avatar", "");
			this.setSetting(i, "id", "");
			this.setSetting(i, "name", "");
			element.querySelector(".accountswitcher-username").innerText = "";
			element.querySelector(".accountswitcher-useravatar").removeAttribute("src");
			element.querySelector(".accountswitcher-removeaccountbtn").setAttribute("disabled", true);
			this.saveSettings();
		});
		return element;
	}

	createToggleSwitch(label, value, callback, spacing = "20px") {
		var element = document.createElement("div");
		element.style.paddingTop = spacing;
		element.style.paddingBottom = spacing;
		element.innerHTML =
			`<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStart-H-X2h- noWrap-3jynv6" style="flex: 1 1 auto;">
			<h3 class="titleDefault-a8-ZSr title-31JmR4 marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3" style="flex: 1 1 auto;">${label}</h3>
			<div id="accountswitcher-encrypttokensdiv" class="flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV ${value == true ? "valueChecked-m-4IJZ" : "valueUnchecked-2lU_20"} value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX" style="flex: 0 0 auto;">
				<input id="accountswitcher-encrypttokenscheckbox" class="checkboxEnabled-CtinEn checkbox-2tyjJg" type="checkbox">
			</div>
		</div>`;
		element.querySelector("input").checked = value;
		element.querySelector("input").addEventListener("click", e => {
			var b = e.currentTarget.parentElement;
			if (b.classList.contains("valueChecked-m-4IJZ")) {
				b.classList.add("valueUnchecked-2lU_20");
				b.classList.remove("valueChecked-m-4IJZ");
			} else {
				b.classList.add("valueChecked-m-4IJZ");
				b.classList.remove("valueUnchecked-2lU_20");
			}
			callback(e);
		});
		return element;
	}

	createWarning(){
		let element = document.createElement("div");
		element.insertAdjacentHTML("beforeend", `
			<style>
				.accountswitcher-warning {
					color: #ff1919;
					padding-top: 20px;
				}
			</style>
			<div class="accountswitcher-warning">${this.local.settings.warning}</div>
		`);
		return element;
	}


	alertText(e, t, callbackOk, callbackCancel) {
		let backdrop = $(`<div class="backdrop-1wrmKB da-backdrop" style="opacity: 0.85; background-color: rgb(0, 0, 0); z-index: 1000; transform: translateZ(0px);"></div>`);
		let a =  $(`<div class="modal-3c3bKg da-modal" style="opacity: 1; transform: scale(1) translateZ(0px); z-index: 9999999">
						<div data-focus-guard="true" tabindex="0" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
						<div data-focus-guard="true" tabindex="1" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
						<div data-focus-lock-disabled="false" class="inner-1ilYF7 da-inner">
							<div class="modal-yWgWj- da-modal container-14fypd da-container sizeSmall-1jtLQy">
								<div class="scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix da-scrollerWrap da-firefoxFixScrollFlex content-1EtbQh da-content scrollerThemed-2oenus da-scrollerThemed themeGhostHairline-DBD-2d">
									<div class="scroller-2FKFPG firefoxFixScrollFlex-cnI2ix da-scroller da-firefoxFixScrollFlex systemPad-3UxEGl da-systemPad inner-ZyuQk0 da-inner content-dfabe7 da-content">
										<h2 class="h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi da-h2 da-title da-size16 da-height20 da-weightSemiBold defaultColor-1_ajX0 da-defaultColor title-18-Ds0 marginBottom20-32qID7 marginTop8-1DLZ1n da-title da-marginBottom20 da-marginTop8">
											${e}
										</h2>
										<div class="body-Mj9Oxz da-body medium-zmzTW- size16-14cGz5 height20-mO2eIN primary-jw0I4K">
											${t}
										</div>
									</div>
								</div>
								<div class="flex-1xMQg5 flex-1O1GKY da-flex da-flex horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyBetween-2tTqYu alignStretch-DpGPf3 wrap-ZIn9Iy footer-3rDWdC da-footer" style="flex: 0 0 auto;">
									<button class="primaryButton-2BsGPp da-primaryButton button-38aScr da-button lookFilled-1Gx00P colorBrand-3pXr91 sizeXlarge-2yFAlZ grow-q77ONN da-grow">
										<div class="contents-18-Yxp da-contents">Okay</div>
									</button>
								</div>
							</div>
						</div>
						<div data-focus-guard="true" tabindex="0" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
					</div>`);
		a.find(".da-footer button").on("click", () => {
			if(typeof callbackOk === "function") callbackOk();
			//a.addClass("closing");
			//backdrop.addClass("closing");
			//window.setTimeout(() => {
				a.remove();
				backdrop.remove();
			//}, 300)
		});
		backdrop.on("click", () => {
			if(typeof callbackCancel === "function") callbackCancel();
			//a.addClass("closing");
			//backdrop.addClass("closing");
			//window.setTimeout(() => {
				a.remove();
				backdrop.remove();
			//}, 300)
		});
		backdrop.appendTo("#app-mount > div[data-no-focus-lock='true'] > div[class*='theme-']:not([class*='popouts-']):not([class*='layerContainer-'])");
		a.appendTo("#app-mount > div[data-no-focus-lock='true'] > div[class*='theme-']:not([class*='popouts-']):not([class*='layerContainer-'])");
		if(a.find("#accountswitcher-passwordinput")){
			a.find("#accountswitcher-passwordinput").on("keydown", e => {
				if(e.which == 13) a.find(".da-footer button").click();
				else if(e.which == 27) backdrop.click();
			});
			a.find("#accountswitcher-passwordinput").focus();
		}
		return a.find("div.da-modal")[0];
	}

	confirm(e, t, callbackConfirm, callbackCancel){
		let backdrop = $(`<div class="backdrop-1wrmKB da-backdrop" style="opacity: 0.85; background-color: rgb(0, 0, 0); z-index: 1000; transform: translateZ(0px);"></div>`);
		let a =  $(`<div class="modal-3c3bKg da-modal" style="opacity: 1; transform: scale(1) translateZ(0px); z-index: 9999999">
						<div data-focus-guard="true" tabindex="0" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
						<div data-focus-guard="true" tabindex="1" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
						<div data-focus-lock-disabled="false" class="inner-1ilYF7 da-inner">
							<div class="modal-yWgWj- da-modal container-14fypd da-container sizeSmall-1jtLQy">
								<div class="scrollerWrap-2lJEkd firefoxFixScrollFlex-cnI2ix da-scrollerWrap da-firefoxFixScrollFlex content-1EtbQh da-content scrollerThemed-2oenus da-scrollerThemed themeGhostHairline-DBD-2d">
									<div class="scroller-2FKFPG firefoxFixScrollFlex-cnI2ix da-scroller da-firefoxFixScrollFlex systemPad-3UxEGl da-systemPad inner-ZyuQk0 da-inner content-dfabe7 da-content">
										<h2 class="h2-2gWE-o title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi da-h2 da-title da-size16 da-height20 da-weightSemiBold defaultColor-1_ajX0 da-defaultColor title-18-Ds0 marginBottom20-32qID7 marginTop8-1DLZ1n da-title da-marginBottom20 da-marginTop8">
											${e}
										</h2>
										<div class="body-Mj9Oxz da-body medium-zmzTW- size16-14cGz5 height20-mO2eIN primary-jw0I4K">
											${t}
										</div>
									</div>
								</div>
								<div class="flex-1xMQg5 flex-1O1GKY da-flex da-flex horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyBetween-2tTqYu alignStretch-DpGPf3 wrap-ZIn9Iy footer-3rDWdC da-footer" style="flex: 0 0 auto;">
									<button class="primaryButton-2BsGPp da-primaryButton button-38aScr da-button lookFilled-1Gx00P colorBrand-3pXr91 sizeXlarge-2yFAlZ grow-q77ONN da-grow" style="margin-left:10px;">
										<div class="contents-18-Yxp da-contents">Cancel</div>
									</button>
									<button class="primaryButton-2BsGPp da-primaryButton button-38aScr da-button lookFilled-1Gx00P colorBrand-3pXr91 sizeXlarge-2yFAlZ grow-q77ONN da-grow">
										<div class="contents-18-Yxp da-contents">Okay</div>
									</button>
								</div>
							</div>
						</div>
						<div data-focus-guard="true" tabindex="0" style="width: 1px; height: 0px; padding: 0px; overflow: hidden; position: fixed; top: 1px; left: 1px;"></div>
					</div>`);
		$(a.find(".da-footer button")[1]).on("click", () => {
			if(typeof callbackConfirm === "function") callbackConfirm();
			a.addClass("closing");
			backdrop.addClass("closing");
			window.setTimeout(() => {
				a.remove();
				backdrop.remove();
			}, 300)
		});
		backdrop.on("click", () => {
			if(typeof callbackCancel === "function") callbackCancel();
			a.addClass("closing");
			backdrop.addClass("closing");
			window.setTimeout(() => {
				a.remove();
				backdrop.remove();
			}, 300)
		});
		$(a.find(".da-footer button")[0]).on("click", () => {
			if(typeof callbackCancel === "function") callbackCancel();
			a.addClass("closing");
			backdrop.addClass("closing");
			window.setTimeout(() => {
				a.remove();
				backdrop.remove();
			}, 300)
		});
		backdrop.appendTo("#app-mount > div[data-no-focus-lock='true'] > div[class*='theme-']:not([class*='popouts-']):not([class*='layerContainer-'])");
		a.appendTo("#app-mount > div[data-no-focus-lock='true'] > div[class*='theme-']:not([class*='popouts-']):not([class*='layerContainer-'])");
		if(a.find("#accountswitcher-passwordinput")){
			a.find("#accountswitcher-passwordinput").on("keydown", e => {
				if(e.which == 13) a.find(".da-footer button").click();
				else if(e.which == 27) backdrop.click();
			});
			a.find("#accountswitcher-passwordinput").focus();
		}
		return a.find("div.da-modal")[0];
	}

	loadLanguage(){
		this.lang = this.settings.language == "auto" ? document.documentElement.getAttribute("lang").split("-")[0] : this.settings.language;
	}

	formatString(input, ...args){
		for(let i = 0; i < args.length; i++){
			input = input.replace(`{${i}}`, args[i]);
		}
		return input;
	}
	hashString(input) {
		var hash = 0, i, chr;
		if (input.length === 0) return hash;
		for (i = 0; i < this.length; i++) {
			chr   = input.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0;
		}
		return hash;
	}





	encrypt(string, key){
		let enc = CryptoJS.AES.encrypt(string, key).toString();
		try{
			let dec = this.decrypt(enc, key);
			if(string == dec) return enc;
			else return this.encrypt(string, key);
		}catch(ex){
			return this.encrypt(string, key);
		}
	}
	decrypt(string, key){
		return CryptoJS.AES.decrypt(string, key).toString(CryptoJS.enc.Utf8);
	}
	
	
	getSetting(i, setting){
		let val = this.settings[setting + i];
		if(typeof val != "string") return val;
		if(val == "") return "";
		try {
			let os = require("os");
			let value = this.decrypt(val, os.platform() + os.type() + "nFagrAetGcHetaFEOvM".charAt(i).repeat(9*i%11));
			return value || val;
		}catch(ex){
			return val;
		}
	}
	setSetting(i, setting, val){
		if(val == "") return this.settings[setting + i] = "";
		if(typeof val != "string") return this.settings[setting + i] = val;
		let os = require("os");
		this.settings[setting + i] = this.encrypt(val, os.platform() + os.type() + "nFagrAetGcHetaFEOvM".charAt(i).repeat(9*i%11));
	}
}
