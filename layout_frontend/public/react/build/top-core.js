var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

TopUI = function () {
    function TopUI() {}

    TopUI.version = '';

    TopUI.getVersion = function () {
        return this.version;
    };

    return TopUI;
}();

/**
 * @namespace data
 * @description TopUI.Data를 통해 data를 정의하고 위젯 속성과의 바인딩을 할 수 있다.
 */
TopUI.Data = function () {
    Data.prototype = Object.create(TopUI.prototype);
    Data.prototype.constructor = Data;

    Data.map = {};
    Data.prototype.__boundWidgets = {};
    Data.prototype.__initialValues = {};
    Data.prototype.__isBackward = false; // backward compatibility
    Data.prototype.__modelInfo = {};

    function Data(obj, name) {
        Object.assign(this, obj);
        this.id = TopUI.Util.guid();
        this.__boundWidgets = {};
        this.__name = name;

        this.__initialValues = this.getValues();
    }

    /**
     * @method create
     * @parameter name (string)
     * @parameter data (object)
     * @return TopUI.Data
     * @description name을 이름으로 하고 data를 갖는 TopUI.Data 객체를 생성한다.
     */
    Data.create = function (name, data) {
        if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object' && data === undefined) {
            // backward compatibility
            return new Data(name, '');
        } else if (typeof name === 'string' && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
            window[name] = new Data(data, name);
        } else {
            console.error('Type error: TopUI.Data.create(string, object)');
        }
    };

    Data.prototype.__addBoundWidget = function (valuePath, widgetId, prop) {
        valuePath = valuePath.split('+')[0];
        var bindingInfo = {};
        bindingInfo.widgetId = widgetId;
        bindingInfo.property = prop;
        bindingInfo.valuePath = valuePath;
        var parts = valuePath.split('.');
        var bindingPath = parts[0];
        if (this.__boundWidgets[bindingPath] === undefined) this.__boundWidgets[bindingPath] = [];
        if (this.__hasBindingInfo(bindingPath, bindingInfo) === false) {
            this.__boundWidgets[bindingPath].push(bindingInfo);
        }
        for (var i = 1, len = parts.length; i < len; i++) {
            bindingPath += '.' + parts[i];
            if (this.__boundWidgets[bindingPath] === undefined) this.__boundWidgets[bindingPath] = [];
            if (this.__hasBindingInfo(bindingPath, bindingInfo) === false) {
                this.__boundWidgets[bindingPath].push(bindingInfo);
            }
        }
    };

    Data.prototype.__hasBindingInfo = function (path, info) {
        var widgets = this.__boundWidgets[path];
        for (var i = 0, len = widgets.length; i < len; i++) {
            if (widgets[i].widgetId === info.widgetId && widgets[i].property === info.property && widgets[i].valuePath === info.valuePath) {
                return true;
            }
        }
        return false;
    };

    Data.prototype.__updateBoundWidgets = function (key, __fromWidgetId) {
        if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
            for (var i = 0, len = key.length; i < len; i++) {
                this.__updateBoundWidgetsImpl(key[i], __fromWidgetId);
            }
        } else {
            this.__updateBoundWidgetsImpl(key, __fromWidgetId);
        }
    };

    Data.prototype.__updateBoundWidgetsImpl = function (key, __fromWidgetId) {
        //key:
        //__fromWidgetId : for other widgets
        var key = this.__searchBoundKey(key);
        if (this.__boundWidgets && this.__boundWidgets[key]) {
            var bindingInfoList = this.__boundWidgets[key];
            for (var i = 0, len = bindingInfoList.length; i < len; i++) {
                var bindingInfo = bindingInfoList[i];

                if (__fromWidgetId && bindingInfo['widgetId'] == __fromWidgetId) continue;

                var widget = TopUI.Dom.selectById(bindingInfo['widgetId']);

                if (bindingInfo['__isInitCalled'] === undefined) bindingInfo['__isInitCalled'] = true;

                var prop = bindingInfo['property'];
                var value = prop === 'items' ? this.getValue(bindingInfo['valuePath'].split('+')[0]) : this.getValue(bindingInfo['valuePath']);
                var obj = {};
                obj[prop] = value;
                if (widget) widget.setProperties(obj);
            }
        }
    };

    Data.prototype.__searchBoundKey = function (key) {
        var parts = key.split('.');
        var path = key;
        var boundKey = '';
        if (this.__boundWidgets[path]) {
            boundKey = path;
        } else {
            for (var i = 1, len = parts.length; i < len; i++) {
                var pos = path.lastIndexOf(parts[len - i]);
                path = path.substring(0, pos - 1);
                if (this.__boundWidgets[path] && this.__hasValuePath(this.__boundWidgets[path], path)) {
                    boundKey = path;
                    break;
                }
            }
        }
        return boundKey;
    };

    Data.prototype.__hasValuePath = function (list, valuePath) {
        for (var i = 0, len = list.length; i < len; i++) {
            if (list[i].valuePath == valuePath) {
                return true;
            }
        }
        return false;
    };

    /**
     * @method .getValues
     * @return object
     * @description 전체 value를 반환한다.
     */
    Data.prototype.getValues = function () {
        var values = {};
        var keys = Object.keys(this);
        for (var i = 0, len = keys.length; i < len; i++) {
            if (keys[i] != 'id' && keys[i] != '__boundWidgets' && keys[i] != '__initialValues' && keys[i] != '__isBackward' && typeof this[keys[i]] !== 'function') {
                values[keys[i]] = JSON.parse(JSON.stringify(this[keys[i]]));
            }
        }
        return values;
    };

    /**
     * @method .getValues
     * @parameter path (string)
     * @return object
     * @description path에 해당하는 value를 반환한다.
     */
    Data.prototype.getValue = function (path) {
        if (this.__isBackward) {
            if (!path.startsWith('data.')) path = 'data.' + path;
        }
        // if (path.includes('+')) {
        //     return this.__getValueWithConverter(path);
        // }
        var value = this;
        var arrPath = path.split('.');
        for (var i = 0, len = arrPath.length; i < len; i++) {
            if (value[arrPath[i]] !== undefined) {
                value = value[arrPath[i]];
            } else {
                return;
            }
        }
        return value;
    };

    Data.prototype.__getValueWithConverter = function (path) {
        var fields = path.split('+')[0];
        var converter = TopUI.Util.namespace(path.split('+')[1]);
        var value = this.getValue(fields);
        if (typeof converter.convert === 'function') {
            return converter.convert(value);
        } else {
            return value;
        }
    };

    Data.prototype.getData = function (keys) {
        return this[keys];
    };

    Data.prototype.setData = function (values) {
        if (this.__isBackward) {
            var keys = Object.keys(values);
            for (var i = 0, len = keys.length; i < len; i++) {
                this['data'][keys[i]] = values[keys[i]];
            }
            this.__updateBoundWidgets('data.' + keys);
        } else if (arguments.length === 2 && typeof arguments[0] === 'string' && _typeof(arguments[1]) === 'object') {
            this.setValue(arguments[0], arguments[1]);
        } else {
            this.setValues(values);
        }
        this.__updateRelationsBinding();
    };

    /**
     * @method .setValues
     * @parameter values (object)
     * @description 전체 value를 입력한다.
     */
    Data.prototype.setValues = function (values) {
        var keys = Object.keys(values);
        for (var i = 0, len = keys.length; i < len; i++) {
            if (keys[i] != 'id' && keys[i] != '__boundWidgets' && keys[i] != '__initialValues') {
                this[keys[i]] = values[keys[i]];
            }
        }
        this.__updateBoundWidgets(keys);
        this.__updateRelationsBinding();
    };

    /**
     * @method .setValue
     * @parameter path (string)
     * @parameter value (object)
     * @description path에 해당하는 value를 입력한다.
     */
    Data.prototype.setValue = function (path, value, __fromWidgetId) {
        if (this.__isBackward && !path.startsWith('data.')) {
            path = 'data.' + path;
        }
        var arrPath = path.split('.');
        var base = this;
        for (var i = 0, len = arrPath.length - 1; i < len; i++) {
            base = base[arrPath[i]] = base[arrPath[i]] || {};
        }
        base[arrPath[len]] = value;
        this.__updateBoundWidgets(path, __fromWidgetId);
        this.__updateRelationsBinding();
    };

    /**
     * @method .addValue
     * @parameter path (string)
     * @parameter value (object)
     * @description path에 해당하는 array의 value를 추가한다.
     */
    Data.prototype.addValue = function (path, value) {
        if (this.__isBackward && !path.startsWith('data.')) {
            path = 'data.' + path;
        }
        var arrPath = path.split('.');
        var base = this;
        for (var i = 0, len = arrPath.length - 1; i < len; i++) {
            base = base[arrPath[i]] = base[arrPath[i]] || {};
        }
        if (Array.isArray(base[arrPath[len]])) {
            if (value instanceof TopUI.Data) {
                base[arrPath[len]].push(value.getValues());
            } else {
                base[arrPath[len]].push(value);
            }
        }
        this.__updateBoundWidgets(path);
        this.__updateRelationsBinding();
    };

    /**
     * @method .removeValue
     * @parameter path (string)
     * @parameter index (object)
     * @description path에 해당하는 array의 index를 제거한다.
     */
    Data.prototype.removeValue = function (path, index) {
        if (this.__isBackward && !path.startsWith('data.')) {
            path = 'data.' + path;
        }
        var arrPath = path.split('.');
        var base = this;
        for (var i = 0, len = arrPath.length - 1; i < len; i++) {
            base = base[arrPath[i]] = base[arrPath[i]] || {};
        }
        if (this.__isBackward && index >= 0) {
            base[arrPath[len]].splice(index, 1);
        } else {
            if (Array.isArray(base)) {
                base.splice(arrPath[len], 1);
            } else {
                delete base[arrPath[len]];
            }
        }
        this.__updateBoundWidgets(path);
        this.__updateBoundDevices(path);
        this.__updateRelationsBinding();
    };

    /**
     * @method .reset
     * @parameter path (string)
     * @description 생성 시점의 값으로 초기화한다.
     */
    Data.prototype.reset = function (path) {
        if (typeof path === 'string') {
            if (this.__isBackward && !path.startsWith('data.')) {
                path = 'data.' + path;
            }
            var arrPath = path.split('.');
            var base = this;
            var initialBase = JSON.parse(JSON.stringify(this.__initialValues));
            for (var i = 0, len = arrPath.length - 1; i < len; i++) {
                base = base[arrPath[i]] = base[arrPath[i]] || {};
                initialBase = initialBase[arrPath[i]] = initialBase[arrPath[i]] || {};
            }
            base[arrPath[len]] = initialBase[arrPath[len]];
            this.__updateBoundWidgets(path);
        } else {
            var keys = Object.keys(this.__initialValues);
            for (var i = 0, len = keys.length; i < len; i++) {
                this[keys[i]] = this.__initialValues[keys[i]];
            }
            this.__updateBoundWidgets(keys);
        }
        this.__updateRelationsBinding();
    };

    /**
     * @method .update
     * @parameter path (string)
     * @description 해당 path와 바인딩된 위젯을 업데이트한다.
     */
    Data.prototype.update = function (path) {
        if (typeof path === 'string') {
            this.__updateBoundWidgets(path);
        }
        this.__updateRelationsBinding();
    };

    Data.prototype.setModel = function (field, modelId) {
        var arrPath = field.split('.');
        var obj;
        if (arrPath.length == 1) {
            this.__modelInfo[arrPath[0]] = {};
            this.__modelInfo[arrPath[0]]['modelId'] = modelId;
        } else {
            if (this.__modelInfo[arrPath[0]]) obj = this.__modelInfo[arrPath[0]];else {
                this.__modelInfo[arrPath[0]] = {};
                obj = this.__modelInfo[arrPath[0]];
            }

            for (var i = 1, len = arrPath.length - 1; i < len; i++) {
                if (obj[arrPath[i]] === undefined) {
                    obj[arrPath[i]] = {};
                }
                obj = obj[arrPath[i]];
            }
            obj[arrPath[len]] = {};
            obj[arrPath[len]]['modelId'] = modelId;
        }
    };

    Data.prototype.getModel = function () {
        return this.__modelInfo;
    };

    Data.prototype.setRelations = function (relations) {
        this.relations = relations;
    };

    Data.prototype.getRelations = function () {
        return this.relations;
    };

    Data.prototype.getDataByRelations = function (relationsId) {
        var relations = this.getRelationsById(relationsId);
        if (this[this.__toInstanceId(relationsId)] === undefined) {
            this[this.__toInstanceId(relationsId)] = this.__makeDataByRelations(relations);
        }
        return this.__toInstanceId(relationsId);
    };

    Data.prototype.getRelationsById = function (relationsId) {
        for (var i = 0, len = this.relations.length; i < len; i++) {
            if (this.relations[i].id === relationsId) {
                return this.relations[i];
            }
        }
    };

    Data.prototype.__makeDataByRelations = function (relations) {
        var relation = relations.Relation;
        var rootId = relation[0].parentId;
        var path = rootId;
        for (var i = 0, len = relation.length; i < len; i++) {
            if (rootId === relation[i].childId) {
                rootId = relation[i].parentId;
                path = rootId.concat('.').concat(path);
            } else {
                path = path.concat('.').concat(relation[i].childId);
            }
            var _this = this;
            var parents = JSON.parse(JSON.stringify(this.getValue(rootId)));
            parents.forEach(function (parent) {
                var children = _this.getValue(relation[i].childId);
                children.forEach(function (child) {
                    if (parent[relation[i].parentField] === child[relation[i].childField]) {
                        if (_typeof(parent[relation[i].childId]) !== 'object') parent[relation[i].childId] = [];
                        parent[relation[i].childId].push(JSON.parse(JSON.stringify(child)));
                    }
                });
            });
        }
        relations.rootId = rootId;
        this.__setRelationModel(path);
        this.__modelInfo[this.__toInstanceId(relations.id)] = this.getModel()[rootId];
        return parents;
    };

    Data.prototype.__setRelationModel = function (path) {
        var keys = path.split('.');
        var key = keys[0];
        this.setModel(key, this.getModel()[keys[0]].modelId);
        for (var i = 1, len = keys.length; i < len; i++) {
            key = key.concat('.').concat(keys[i]);
            this.setModel(key, this.getModel()[keys[i]].modelId);
        }
    };

    Data.prototype.getRootId = function (relationsId) {
        for (var i = 0, len = this.relations.length; i < len; i++) {
            if (this.relations[i].id === relationsId) {
                return this.relations[i].rootId;
            }
        }
    };

    Data.prototype.__toInstanceId = function (relationsId) {
        return '__relations__'.concat(relationsId);
    };

    Data.prototype.__updateRelationsBinding = function () {
        var relations = this.getRelations();
        if (relations !== undefined) {
            for (var i = 0, len = relations.length; i < len; i++) {
                var instanceId = this.__toInstanceId(relations[i].id);
                this[instanceId] = this.__makeDataByRelations(relations[i]);
                this.__updateBoundWidgets(instanceId);
            }
        }
    };

    Data.prototype.__clearBindingInfo = function (valuePath, widgetId) {
        valuePath = valuePath.split('+')[0];
        var parts = valuePath.split('.');
        var bindingPath = parts[0];
        var bindingInfoList = this.__boundWidgets[bindingPath];
        if (bindingInfoList === undefined) return;
        for (var i = bindingInfoList.length - 1; i >= 0; i--) {
            if (bindingInfoList[i].widgetId === widgetId) {
                bindingInfoList.splice(i, 1);
            }
        }
        for (var j = 1, len2 = parts.length; j < len2; j++) {
            bindingPath += '.' + parts[j];
            bindingInfoList = this.__boundWidgets[bindingPath];
            for (var i = bindingInfoList.length - 1; i >= 0; i--) {
                if (bindingInfoList[i].widgetId === widgetId) {
                    bindingInfoList.splice(i, 1);
                }
            }
        }
    };

    Data.prototype.map = function (callback) {
        var data = this.getValues();
        delete data['__name'];
        var array = Object.values(data);
        return array.map(function (item, index, array) {
            return callback(item, index, array);
        });
    };

    // TOP Generator
    Data.__modelList = {};

    Data.createModel = function (packageName, id, dataFields) {
        this.__modelList[id] = dataFields;
        this.createClass(packageName, id, Object.keys(dataFields));
    };

    Data.getDataModel = function (id) {
        return this.__modelList[id];
    };

    Data.__classList = {};

    Data.createClass = function (packageName, id, fieldNames) {
        var paths = packageName.split('.');
        var path = paths[0];
        window[path] = window[path] || {};
        var pkg = window[path];
        for (var i = 1, len = paths.length; i < len; i++) {
            pkg[paths[i]] = pkg[paths[i]] || {};
            pkg = pkg[paths[i]];
        }
        pkg[id] = {};
        pkg[id].class = id;
        for (var i = 0, len = fieldNames.length; i < len; i++) {
            pkg[id][fieldNames[i]] = '';
        }
        this.__classList[id] = pkg[id];
    };

    Data.getClass = function (className) {
        return this.__classList[className];
    };

    /**
     * @method .toTreeNodes
     * @parameter origin (object)
     * @parameter keyMap (object)
     * @return object
     * @description TopUI.Widget.Treeview에 바인딩하기 위해 1차원 데이터를 tree 구조 데이터로 변환한다.
     */
    Data.toTreeNodes = function (origin, keyMap) {
        if (!keyMap.hasOwnProperty('id') || !keyMap.hasOwnProperty('level')) return;
        var data = [];
        var lowData = {};
        var rootLevel = 1;
        for (var i = 0, len = origin.length; i < len; i++) {
            if (origin[i][keyMap.level] === 0 || origin[i][keyMap.level] === '0') {
                rootLevel = 0;
                break;
            }
        }
        for (i = 0, len = origin.length; i < len; i++) {
            var level = Number.isInteger(origin[i][keyMap.level]) === true ? origin[i][keyMap.level] : parseInt(origin[i][keyMap.level]);
            if (level === rootLevel) {
                data.push({
                    id: origin[i][keyMap.id],
                    text: origin[i][keyMap.text]
                });
                this.__copyProperties(data[data.length - 1], origin[i], keyMap);
            } else if (level > rootLevel) {
                if (lowData[level] === undefined) lowData[level] = [];
                lowData[level].push(origin[i]);
            }
        }
        var levels = Object.keys(lowData);
        for (i = 0, len = levels.length; i < len; i++) {
            var curData = lowData[levels[i]];
            for (var j = 0, len2 = curData.length; j < len2; j++) {
                var parent = this.__searchObjectById(data, curData[j][keyMap.parentId]);
                if (parent !== undefined) {
                    this.__addChildNode(parent, curData[j], keyMap);
                }
            }
        }
        return data;
    };

    Data.syncTreeNodes = function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
            syncChildren(nodes[i].children, nodes[i]);
        }

        function syncChildren(childrenArr, upperNode) {
            var childrenLength = childrenArr.length;
            var currentPath = '';
            if (upperNode.path == '') {
                currentPath = upperNode.id;
            } else {
                currentPath = upperNode.path + '.' + upperNode.id;
            }
            var currentLevel = parseInt(upperNode.level) + 1;
            for (var i = 0; i < childrenLength; i++) {
                var currentNode = childrenArr[i];
                currentNode.path = currentPath;
                currentNode.level = currentLevel;
                currentNode.parentId = upperNode.id;
                var childrenOfcurrentNode = currentNode.children;
                if (childrenOfcurrentNode != null && (typeof childrenOfcurrentNode === 'undefined' ? 'undefined' : _typeof(childrenOfcurrentNode)) == 'object' && childrenOfcurrentNode.length >= 1) {
                    syncChildren(childrenOfcurrentNode, currentNode);
                }
            }
        }
    };

    Data.__addChildNode = function (parent, child, keyMap) {
        if (parent.children === undefined) {
            parent.children = [];
        }
        if (child[keyMap.seq]) {
            var index = parseInt(child[keyMap.seq]) - 1;
            parent.children.splice(index, 0, {
                id: child[keyMap.id],
                text: child[keyMap.text]
            });
            var i = parent.children.length <= index ? parent.children.length - 1 : index;
            this.__copyProperties(parent.children[i], child, keyMap);
        } else {
            parent.children.push({
                id: child[keyMap.id],
                text: child[keyMap.text]
            });
            this.__copyProperties(parent.children[parent.children.length - 1], child, keyMap);
        }
    };

    Data.__searchObjectById = function (array, id) {
        var result;
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i].id === id) {
                return array[i];
            } else if (_typeof(array[i].children) === 'object') {
                result = this.__searchObjectById(array[i].children, id);
                if (result) {
                    return result;
                }
            }
        }
    };

    Data.__copyProperties = function (target, source, keyMap) {
        var keys = Object.keys(keyMap);
        for (var i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            if (key !== 'id' && key !== 'text' && key !== 'children') {
                target[keys[i]] = source[keyMap[keys[i]]];
            }
        }
    };

    return Data;
}();

TopUI.Dom = function () {
    Dom.prototype = Object.create(TopUI.prototype);
    Dom.prototype.constructor = Dom;

    function Dom() {}

    Dom.__selectImpl = function (element) {
        var key = Object.keys(element).find(function (key) {
            return key.startsWith('__reactInternalInstance$');
        });
        var internalInstance = element[key];
        if (internalInstance == null) return null;

        if (internalInstance.return) {
            // react 16+
            return internalInstance._debugOwner ? internalInstance._debugOwner.stateNode : internalInstance.return.stateNode;
        } else {
            // react <16
            return internalInstance._currentElement._owner._instance;
        }
    };
    Dom.selectById = function (id) {
        if (!id || id === '') return null;
        if (!document.getElementById(id)) return null;
        // // contextmenu
        // if (typeof TopUI.ContextMenu.get(id) === 'string') {
        //     return this.__selectImpl(TopUI.ContextMenu.getWidgetById(id).template);
        // }
        //
        // var controller = TopUI.Controller.getCurrent();
        // if (controller && typeof controller.getBoundWidget === 'function') {
        //     var parent = controller.getBoundWidget();
        //     if (parent && typeof parent.selectById === 'function') {
        //         var widget = parent.selectById(id);
        //     }
        // }
        // if (widget) return widget;
        return TopUI.Widget.create(this.__selectImpl(document.getElementById(id)).props.tagName, undefined, undefined, this.__selectImpl(document.getElementById(id)));
    };

    return Dom;
}();

/**
 * @namespace ajax
 * @description TopUI.Ajax를 통해 ajax를 수행할 수 있다.
 */
TopUI.Ajax = function () {
    Ajax.prototype = Object.create(TopUI.prototype);
    Ajax.prototype.constructor = Ajax;

    function Ajax() {}

    /**
     * @method execute
     * @parameter url (string)
     * @parameter settings (object)
     * @description ajax를 실행한다.
     */
    Ajax.execute = function (url, settings) {
        if ((typeof url === 'undefined' ? 'undefined' : _typeof(url)) === 'object' && typeof settings === 'undefined') {
            var settings = url;
            url = settings.url;
        }
        var type = settings.type ? settings.type : 'get';
        var async = settings.async !== undefined ? settings.async : true;
        var responseType = settings.dataType !== undefined ? settings.dataType : '';
        var _headers = settings.headers;
        var _beforeSend = settings.beforeSend;
        var _success = settings.success;
        var _error = settings.error;
        var _complete = settings.complete;
        if (type.toLowerCase() === 'get' && settings.data) {
            url += TopUI.Ajax.toQueryString(settings.data);
        }
        var xhr = new XMLHttpRequest();
        xhr.open(type, url, async);
        if (async) xhr.responseType = responseType;
        if (_headers !== undefined && _headers !== null && (typeof _headers === 'undefined' ? 'undefined' : _typeof(_headers)) === 'object') {
            for (i in _headers) {
                xhr.setRequestHeader(i, _headers[i]);
            }
        }
        if (_beforeSend !== undefined && typeof _beforeSend === 'function') {
            var result = _beforeSend(xhr);
            if (result !== undefined && !result) {
                return false;
            }
        }
        var contentType = typeof settings.contentType === 'string' ? settings.contentType : 'application/json';
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.onload = function () {
            if (xhr.status === 200) {
                if (typeof xhr.response === 'string' && !xhr.response.startsWith('<') && typeof settings.response === 'string') {
                    var dataName = TopUI.Util.getDataName(settings.response);
                    if (dataName) {
                        var dataObj = TopUI.Util.namespace(dataName);
                        if (dataObj instanceof TopUI.Data) {
                            var path = settings.response.split(dataName + '.')[1];
                            dataObj.setValue(path, xhr.response);
                        }
                    }
                }
                if (typeof _success === 'function') _success(xhr.response, xhr.status, xhr);
            } else {
                if (typeof _error === 'function') _error(xhr, xhr.status);
            }
            if (typeof _complete === 'function') _complete(xhr, xhr.status);
        };
        if ((type.toLowerCase() === 'post' || type.toLowerCase() === 'put' || type.toLowerCase() === 'delete') && settings.data) {
            var data = typeof settings.data === 'string' ? settings.data : JSON.stringify(settings.data);
            xhr.send(data);
        } else {
            xhr.send();
        }
    };

    Ajax.executeById = function (id) {
        TopUI.Dom.selectById(id).execute();
    };

    Ajax.get = function (url, request, response, onSuccess, onFail) {
        var settings = {};
        settings.type = 'get';
        settings.data = request;
        settings.response = response;
        settings.success = onSuccess;
        settings.error = onFail;
        this.execute(url, settings);
    };

    Ajax.post = function (url, request, response, onSuccess, onFail) {
        var settings = {};
        settings.type = 'post';
        settings.data = request;
        settings.response = response;
        settings.success = onSuccess;
        settings.error = onFail;
        this.execute(url, settings);
    };

    Ajax.toQueryString = function (data) {
        if (typeof data === 'string') {
            return '?' + data;
        } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
            return '?' + $.param(data);
        }
    };

    return Ajax;
}();

TopUI.Util = function () {
    Util.prototype = Object.create(TopUI.prototype);
    Util.prototype.constructor = Util;

    Util.propertyAliases = {};

    function Util() {}

    Util.guid = function () {
        return 'zxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
    };

    Util.getFileExtension = function (fileName) {
        return fileName.split('.').pop();
    };

    Util.namespace = function (string, widget) {
        if (typeof string !== 'string') {
            return null;
        } else {
            return this.__stringToObject(string, widget);
        }
    };

    Util.getDataName = function (path, widget) {
        var parts = path.split('.');
        var dataName = '';
        for (var i = 0, len = parts.length; i < len; i++) {
            if (dataName === '') {
                dataName = dataName.concat(parts[i]);
            } else {
                dataName = dataName.concat('.' + parts[i]);
            }
            if (TopUI.Util.namespace(dataName, widget) instanceof TopUI.Data) {
                return dataName;
            }
        }
        return '';
    };

    Util.__stringToObject = function (str, widget, __originWidet) {
        return this.__searchObject(window, str);
    };

    Util.__searchObject = function (base, str) {
        var object = base;
        var parts = str.split('.');
        for (var i = 0; i < parts.length; i++) {
            if (typeof object[parts[i]] === 'undefined') {
                return undefined;
            }
            object = object[parts[i]];
        }
        return object;
    };

    Util.toCamelCase = function (string) {
        return string.replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    };

    Util.capitalizeFirstLetter = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    Util.__isStyleProperty = function (property) {
        var styleRegexp = /^(opacity|background|backgroundColor|backgroundImage|tileMode|maxWidth|minWidth|maxHeight|minHeight|lineHeight|padding|margin|visible|display|zIndex|float|position|horizontalAlignment|verticalAlignment|layoutHorizontalAlignment|layoutVerticalAlignment|layoutHeight|layoutWidth|layoutTop|layoutLeft|layoutRight|layoutBottom|borderWidth|borderBottomWidth|borderLeftWidth|borderRightWidth|borderTopWidth|borderStyle|borderColor|borderRadius|verticalScroll|horizontalScroll)$/;
        return styleRegexp.test(property);
    };

    Util.__isTopWidget = function (tagName) {
        if (tagName) {
            var name = tagName.toLowerCase();
        }
        return (/^top-[a-zA-Z]*/.test(name) && TopUI.Render.topWidgets[name] !== undefined || TopUI.Render.topWidgets[name] !== undefined && TopUI.Render.topWidgets[name].isCustomType === true
        );
    };

    Util.__getRawValue = function (str) {
        if (str.startsWith('@raw')) {
            str = str.split('?')[0];
            var id = str.substr(str.indexOf('/') + 1);
            return TopUI.RawManager.get(id.split('.')[0]);
        } else {
            return str;
        }
    };

    Util.__getPropConfigs = function (widget) {
        // returns TopWidget.propConfigs
        // FIXME: temporary TopWidgetUI.propConfigs
        // fix to TopWidget.propConfigs after developed full version
        return eval(TopUI.Util.capitalizeFirstLetter(TopUI.Util.toCamelCase(widget.props.tagName)) + 'UI').propConfigs;
    };

    Util.__validateProperties = function (key, value, config) {
        var convertedValue = value;
        if (config.type instanceof Array) {
            var returnFlag = true;
            for (var i = 0; i < config.type.length; i++) {
                // if types match, continue to validate
                if ((typeof convertedValue === 'undefined' ? 'undefined' : _typeof(convertedValue)) === _typeof(config.type[i]())) {
                    config.type = config.type[i];
                    returnFlag = false;
                    break;
                }
                // if type[i] is Number or Object, inspect convertedValue
                if (_typeof(config.type[i]()) === 'object') {
                    if (typeof convertedValue === 'string' && (convertedValue.startsWith('{') || convertedValue.startsWith('['))) {
                        config.type = config.type[i];
                        returnFlag = false;
                        break;
                    }
                }
            }
            // if not break, return unchanged
            // must be handled in widget render()
            if (returnFlag) return convertedValue;
        }
        // object & array type
        if (_typeof(config.type()) === 'object') {
            return TopUI.Util.__validateObjectProperty(key, value, config);
        }
        // type check & conversion
        if ((typeof convertedValue === 'undefined' ? 'undefined' : _typeof(convertedValue)) !== _typeof(config.type())) {
            console.warn('PropertyWarning: type of property \'' + key + '\' given as \'' + TopUI.Util.capitalizeFirstLetter(typeof convertedValue === 'undefined' ? 'undefined' : _typeof(convertedValue)) + '\' should be \'' + TopUI.Util.capitalizeFirstLetter(_typeof(config.type())) + '\'. Automatically changed to \'' + TopUI.Util.capitalizeFirstLetter(_typeof(config.type())) + '\'.');
            if (typeof config.type() === 'boolean') {
                if (convertedValue === 'true') convertedValue = true;else if (convertedValue === 'false') convertedValue = false;else convertedValue = config.type(convertedValue);
            } else {
                convertedValue = config.type(convertedValue);
            }
        }
        // option check & adjustment
        if (config.options && config.options.indexOf(convertedValue) < 0) {
            console.warn('PropertyWarning: property \'' + key + '\' given as \'' + convertedValue + '\' should be one of [' + config.options + ']. ' + 'Automatically changed to \'' + config.default + '\'.');
            convertedValue = config.default;
        }
        return convertedValue;
    };

    Util.__validateObjectProperty = function (prop, object, config) {
        function printWarning(key, prop, shape) {
            if (!shape) {
                console.warn('PropertyWarning: property \'' + prop + '\' has no config.');
            } else if (key) {
                console.warn('PropertyWarning: key \'' + key + '\' is not suitable key for property \'' + prop + '\'.');
            } else {
                console.warn('PropertyWarning: \'' + object + '\' is not object for property \'' + prop + '\'.');
            }
        }

        var convertedObject = object;
        // if 'object' is not object, convert to object
        if ((typeof convertedObject === 'undefined' ? 'undefined' : _typeof(convertedObject)) !== _typeof(config.type())) {
            if (typeof convertedObject === 'string') {
                if (convertedObject.startsWith('{') || convertedObject.startsWith('[')) {
                    // String '{'aaa':xxx}' - JSON.parse
                    convertedObject = JSON.parse(convertedObject);
                } else {
                    // String 'objectName' - Top.Util.namespace
                    convertedObject = TopUI.Util.namespace(convertedObject) || convertedObject;
                }
                // even if 'object' is string after conversion, abort
                if ((typeof convertedObject === 'undefined' ? 'undefined' : _typeof(convertedObject)) !== _typeof(config.type())) {
                    printWarning(null, prop);
                    return convertedObject;
                }
            }
        }

        // TODO: compare typeof config and typeof convertedObject
        // var isArray = typeof convertedObject === typeof config.type() && convertedObject.length !== undefined && config.type().length !== undefined;
        // var isObject = typeof convertedObject === typeof config.type() && convertedObject.length === undefined && config.type().length === undefined;
        // convertedObject instanceof Array

        // if 'object' is array, check arrayOf
        if (convertedObject instanceof Array) {
            for (var i = 0; i < convertedObject.length; i++) {
                if (!config.arrayOf) break;
                convertedObject[i] = config.arrayOf(convertedObject[i]);
            }
        } else {
            // if 'object' is object, check shape
            // key validation
            for (var key in convertedObject) {
                if (!config.shape) {
                    printWarning(key, prop, null);
                    break;
                }
                if (!config.shape[key]) {
                    // if key is not in shape, print warning and skip validation
                    // TODO: discuss deletion or keep
                    printWarning(key, prop);
                    continue;
                }
                // if key exists, check & convert type
                convertedObject[key] = TopUI.Util.__validateProperties(key, convertedObject[key], config.shape[key]);
            }
        }
        console.log('final result: ', convertedObject);
        return convertedObject;
    };

    // gathers property aliases all of widgets
    Util.__gatherPropertyAliases = function () {
        for (var widget in TopUI.Render.topWidgets) {
            if (TopUI.Render.topWidgets[widget].propConfigs) {
                var configs = TopUI.Render.topWidgets[widget].propConfigs;
                for (var prop in configs) {
                    if (configs[prop].aliases) {
                        var aliases = configs[prop].aliases;
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = aliases[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var alias = _step.value;

                                TopUI.Util.propertyAliases[alias] = prop;
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    Util.__setDefaultProperties = function (properties, configs) {
        for (var key in configs) {
            if (!properties[key] && configs[key].default !== undefined) {
                console.warn('PropertyWarning: property \'' + key + '\' given as \'' + properties[key] + '\' should have value. ' + 'Automatically changed to \'' + configs[key].default + '\'.');
                properties[key] = configs[key].default;
            }
        }
    };

    Util.__convertProperties = function (properties, configs) {
        var convertedProperties = {};
        if (configs) {
            var __configs = $.extend(true, {}, configs); // configs deep copy
        }
        var keys = Object.keys(properties);
        for (var i = 0, len = keys.length; i < len; i++) {
            var attrName = keys[i];
            if (attrName.includes('-')) {
                attrName = attrName.replace(/-([a-z])/g, function (g) {
                    return g[1].toUpperCase();
                });
            }
            convertedProperties[attrName] = properties[keys[i]];
            if (TopUI.Util.propertyAliases[attrName]) {
                console.warn('PropertyWarning: property \'' + attrName + '\' is an alias of \'' + TopUI.Util.propertyAliases[attrName] + '\'. Automatically changed to \'' + TopUI.Util.propertyAliases[attrName] + '\'.');
                convertedProperties[TopUI.Util.propertyAliases[attrName]] = convertedProperties[attrName];
                properties[TopUI.Util.propertyAliases[attrName]] = convertedProperties[attrName];
                attrName = TopUI.Util.propertyAliases[attrName];
            }
            if (configs && configs[attrName]) {
                convertedProperties[attrName] = TopUI.Util.__validateProperties(attrName, convertedProperties[attrName], __configs[attrName]);
            }
            var resourcePattern = /^@(string|color|dimen|raw|drawable|style|theme)(\/[a-zA-Z0-9]+)+$/gm;
            var originValue = properties[keys[i]];
            if (resourcePattern.test(properties[keys[i]])) {
                var modifiedValue;
                var resourceType = originValue.split('/')[0];
                var resourceId = originValue.substr(originValue.indexOf('/') + 1);
                switch (resourceType) {
                    case '@drawable':
                        {
                            modifiedValue = TopUI.DrawableManager.get(resourceId);
                            break;
                        }
                    case '@raw':
                        {
                            modifiedValue = TopUI.RawManager.get(resourceId);
                            break;
                        }
                    default:
                        {
                            resourceId = resourceId.substr(0, resourceId.lastIndexOf('/'));
                            var resourceName = originValue.split('/');
                            resourceName = resourceName[resourceName.length - 1];

                            switch (resourceType) {
                                case '@string':
                                    {
                                        modifiedValue = TopUI.ValuesManager.get('strings', resourceId)[resourceName];
                                        break;
                                    }
                                case '@color':
                                    {
                                        modifiedValue = TopUI.ValuesManager.get('colors', resourceId)[resourceName];
                                        break;
                                    }
                                case '@dimen':
                                    {
                                        modifiedValue = TopUI.ValuesManager.get('dimen', resourceId)[resourceName];
                                        break;
                                    }
                            }
                        }
                }
                convertedProperties[attrName] = modifiedValue;
            }
        }
        return convertedProperties;
    };

    Util.__addClassToClassList = function (classList, classString, toggleClassList) {
        if (toggleClassList) toggleClassList.forEach(function (c) {
            if (classList.indexOf(c) > 0) classList.splice(classList.indexOf(c), 1);
        });
        if (classString && !classList.includes(classString)) classList.push(classString);
        return classList;
    };

    Util.__classListToClassString = function (array) {
        var str = '';
        for (var i = 0; i < array.length; i++) {
            if (i === 0) str = array[i];else str = str + ' ' + array[i];
        }
        return str;
    };

    Util.__classStringToClassList = function (classString, classList) {
        if (!classList) var classList = [];
        if (classString) classString.split(' ').forEach(function (c) {
            if (!classList.includes(c)) classList.push(c);
        });
        return classList;
    };

    return Util;
}();

/**
 * @namespace drawablemanager
 * @description
 */
TopUI.DrawableManager = function () {
    DrawableManager.prototype = Object.create(TopUI.prototype);
    DrawableManager.prototype.constructor = DrawableManager;

    function DrawableManager() {}

    DrawableManager.__map = {};

    DrawableManager.create = function (obj) {
        Object.assign(DrawableManager.__map, obj);
    };

    /**
     * @method get
     * @parameter id (string)
     * @return object
     * @description id에 해당하는 drawable의 value를 반환한다.
     */
    DrawableManager.get = function (id) {
        return DrawableManager.__map[id];
    };

    return DrawableManager;
}();

/**
 * @namespace rawmanager
 * @description
 */
TopUI.RawManager = function () {
    RawManager.prototype = Object.create(TopUI.prototype);
    RawManager.prototype.constructor = RawManager;

    function RawManager() {}

    RawManager.__map = {};

    RawManager.create = function (obj) {
        var keys = Object.keys(obj);
        var newObj = {};
        for (var i = 0, len = keys.length; i < len; i++) {
            newObj[keys[i].split('.')[0]] = obj[keys[i]];
        }
        Object.assign(RawManager.__map, newObj);
    };

    /**
     * @method get
     * @parameter id (string)
     * @return object
     * @description id에 해당하는 raw의 value를 반환한다.
     */
    RawManager.get = function (id) {
        return RawManager.__map[id];
    };

    return RawManager;
}();

/**
 * @namespace valuesmanager
 * @description
 */
TopUI.ValuesManager = function () {
    ValuesManager.prototype = Object.create(TopUI.prototype);
    ValuesManager.prototype.constructor = ValuesManager;

    function ValuesManager() {}

    ValuesManager.__map = {
        'strings': {},
        'colors': {},
        'dimens': {}
    };

    ValuesManager.create = function (type, obj) {
        Object.assign(ValuesManager.__map[type], obj);
    };

    /**
     * @method get
     * @parameter id (string)
     * @return object
     * @description id에 해당하는 values의 value를 반환한다.
     */
    ValuesManager.get = function (type, id) {
        return ValuesManager.__map[type][id];
    };

    return ValuesManager;
}();