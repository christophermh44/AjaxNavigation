function AjaxNavigation() {
	this.definition = {
		binds: [
			{
				el: 'form',
				exclude: function(element) {
					return element.getAttribute('data-ajax-navigation-exclude');
				},
				event: 'submit',
				url: function(element) {
					return element.getAttribute('action');
				},
				method: function(element) {
					return element.getAttribute('method') || 'get';
				},
				data: function(element) {
					return [].filter.call(element.elements, function(el) {
						return (el.getAttribute('type') != 'radio' && el.getAttribute('type') != 'checkbox') || el.checked;
					}).filter(function(el) {
						return !!el.name;
					}).map(function(el) {
						return encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value);
					}).join('&');
				},
				headers: {
					'Content-type': 'application/x-www-form-urlencoded'
				}
			},
			{
				el: window,
				event: 'popstate',
				url: function(element, event) {
					return !event.state || !event.state.url ? null : event.state.url;
				},
				once: true
			},
			{
				el: 'a:not([download])',
				exclude: function(element) {
					return element.getAttribute('data-ajax-navigation-exclude') || /^#/.test(element.getAttribute('href'));
				},
				event: 'click',
				url: function(element) {
					return element.getAttribute('href');
				},
				method: 'get',
				data: null,
				headers: []
			}
		],
		beforeLoad: null,
		afterLoad: null,
		originalProtocol: window.location.protocol,
		originalDomain: window.location.protocol + '//' + window.location.hostname + (window.location.port !== '' ? ':' : '') + window.location.port,
		constructor: function(params) {
			var self = this;
			if (!!params && !!params.binds) {
				params.binds.forEach(function(bind) {
					self.binds.push(bind);
				});
			}
			if (!!params.beforeLoad) {
				this.beforeLoad = params.beforeLoad;
			}
			if (!!params.afterLoad) {
				this.afterLoad = params.afterLoad;
			}
			if (!!this.beforeLoad) {
				this.beforeLoad();
			}
			this.bindNavigationEvents();
			if (!!this.afterLoad) {
				this.afterLoad();
			}
		},
		addBind: function(bind) {
			this.binds.push(bind);
		},
		bindNavigationEvents: function() {
			var self = this;
			this.binds.filter(function(bind) {
				return !bind.once || !bind.onced;
			}).forEach(function(bind) {
				if (!!bind.once) {
					bind.onced = true;
				}
				[].forEach.call([].filter.call(typeof bind.el === typeof '' ? document.querySelectorAll(bind.el) : (bind.el instanceof NodeList ? bind.el : [bind.el]), function(element) {
					return !bind.exclude || !(bind.exclude(element));
				}), function(element) {
					element.addEventListener(bind.event, function(event) {
						var method = (typeof bind.method === typeof '' ? bind.method : (typeof bind.method === typeof (new Function) ? bind.method(element, event) : 'get')).toLowerCase();
						var url = (typeof bind.url === typeof '' ? bind.url : bind.url(element, event));
						var data = (typeof bind.data === typeof '' ? bind.data : (typeof bind.data === typeof (new Function) ? bind.data(element, event) : null));
						var headers = (function(headers) {
							var h = new Headers();
							for (var key in headers) {
								if (headers.hasOwnProperty(key)) {
									h.append(key, headers[key]);
								}
							}
							return h;
						})(!!bind.headers ? bind.headers : {});
						if (/^\/([^\/]|$)/.test(url)) {
							url = self.originalDomain + url;
						} else if (/^\/\//.test(url)) {
							url + self.originalProtocol + ':' + url;
						}
						if (url !== null && url.indexOf(self.originalDomain) === 0) {
							event.preventDefault();
							if (!!self.beforeLoad) {
								self.beforeLoad();
							}
							Pace.restart();
							var params = {
								method: method,
								headers: headers,
								credentials: 'same-origin'
							};
							if (!!data) {
								if (method == 'post') {
									params.body = data;
								} else {
									url += (url.indexOf('?') > 0 ? '&' : '?') + data;
								}
							}
							Pace.track(function() {
								fetch(url, params).then(function(response) {
									return response.text();
								}).then(function(response) {
									var html = document.createElement('html');
									html.innerHTML = response;
									if (event.type !== 'popstate') {
										window.history.pushState({
											url: url
										}, html.querySelector('title').innerHTML, url);
									}
									document.querySelector('html').attributes = html.attributes;
									document.head.attributes = html.querySelector('head').attributes;
									document.body.attributes = html.querySelector('body').attributes;
									document.querySelector('html').classList = html.classList;
									document.head.classList = html.querySelector('head').classList;
									document.body.classList = html.querySelector('body').classList;
									document.head.innerHTML = html.querySelector('head').innerHTML;
									document.body.innerHTML = html.querySelector('body').innerHTML;
									var hash;
									if (hash = (/(#.*)$/.exec(url) || [null])[0]) {
										document.location.hash = '';
										document.location.hash = hash;
									} else {
										window.scrollTo(0, 0);
									}
									self.bindNavigationEvents();
									if (!!self.afterLoad) {
										self.afterLoad();
									}
									Pace.stop();
								});
							});
							return false;
						}
					});
				});
			});
		}
	};

	this.definition.constructor.apply(this.definition, arguments);
	return this.definition;
}
