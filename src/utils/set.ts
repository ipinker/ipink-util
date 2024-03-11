

/**
 * @desc 设置页面标题
 * @param title { string }
 * @return: 
 */
export const setTitle = (title: string): void => {
	// H5平台
	//#ifdef  H5
    // @ts-ignore
	if (window?.AlipayJSBridge) AlipayJSBridge.call("setTitle", { title: title });
    else {
		document.title = title;
	}
    return;
	//#endif 
	// 除了 H5 平台，其它平台均存在的代码
	// #ifndef H5
	uni?.setNavigationBarTitle && uni.setNavigationBarTitle({ title: title })
	// #endif
}
