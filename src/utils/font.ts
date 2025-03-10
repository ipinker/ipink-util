
// android禁止微信浏览器调整字体大小
export const disabledFontChange = () => {
	try {
		// @ts-ignore
		if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
			handleFontSize();
		} else {
			if (document.addEventListener) {
				document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
				// @ts-ignore
			} else if (document.attachEvent) {
				// @ts-ignore
				document.attachEvent("WeixinJSBridgeReady", handleFontSize);
				// @ts-ignore
				document.attachEvent("onWeixinJSBridgeReady", handleFontSize);
			}
		}
		// @ts-ignore
		if (window.AlipayJSBridge) {
			// @ts-ignore
			AlipayJSBridge.call('setToolbarMenu', {
				menus: [{
					name: "",
					tag: "H5MenuActionOfFont",
					icon: ""
				}, ],
				override: true,
			}, function(e: any) {
				console.log(e, 'e')
			});
		}

		function handleFontSize() {
			// @ts-ignore
			WeixinJSBridge.invoke('setFontSizeCallback', {
				'fontSize': 0
			});
			// @ts-ignore
			WeixinJSBridge.on('menu:setfont', function() {
				// @ts-ignore
				WeixinJSBridge.invoke('setFontSizeCallback', {
					'fontSize': 0
				});
			});

		}

		let style='<style>body{-webkit-text-size-adjust: 100% !important;text-size-adjust: 100% !important;-moz-text-size-adjust: 100% !important;}</style>';
		let ele = document.createElement('div');
		ele.innerHTML= style;
		// @ts-ignore
		document.getElementsByTagName('head')[0].appendChild(ele.firstElementChild)
		// @ts-ignore
		document.body.style['webkitTextSizeAdjust'] = '100%'
		// @ts-ignore
		document.body.style['textSizeAdjust'] = '100% !important'
		// @ts-ignore
		document.body.style['mozTextSizeAdjust'] = '100% !important'
	} catch(e: any) {

	}
}
