var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
}
;
TopUI = function() {
    function TopUI() {}
    TopUI.version = '';
    TopUI.getVersion = function() {
        return this.version
    }
    ;
    TopUI.setVersion = function(version) {
        this.version = version
    }
    ;
    return TopUI
}();
TopUI.Data = function() {
    Data.prototype = Object.create(TopUI.prototype);
    Data.prototype.constructor = Data;
    Data.map = {};
    Data.prototype.__boundWidgets = {};
    Data.prototype.__initialValues = {};
    Data.prototype.__isBackward = false;
    Data.prototype.__modelInfo = {};
    function Data(obj, name) {
        Object.assign(this, obj);
        this.id = TopUI.Util.guid();
        this.__boundWidgets = {};
        this.__name = name;
        this.__initialValues = this.getValues()
    }
    Data.create = function(name, data) {
        if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object' && data === undefined) {
            return new Data(name,'')
        } else if (typeof name === 'string' && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
            window[name] = new Data(data,name)
        } else {
            console.error('Type error: TopUI.Data.create(string, object)')
        }
    }
    ;
    Data.prototype.__addBoundWidget = function(valuePath, widgetId, prop) {
        valuePath = valuePath.split('+')[0];
        var bindingInfo = {};
        bindingInfo.widgetId = widgetId;
        bindingInfo.property = prop;
        bindingInfo.valuePath = valuePath;
        var parts = valuePath.split('.');
        var bindingPath = parts[0];
        if (this.__boundWidgets[bindingPath] === undefined)
            this.__boundWidgets[bindingPath] = [];
        if (this.__hasBindingInfo(bindingPath, bindingInfo) === false) {
            this.__boundWidgets[bindingPath].push(bindingInfo)
        }
        for (var i = 1, len = parts.length; i < len; i++) {
            bindingPath += '.' + parts[i];
            if (this.__boundWidgets[bindingPath] === undefined)
                this.__boundWidgets[bindingPath] = [];
            if (this.__hasBindingInfo(bindingPath, bindingInfo) === false) {
                this.__boundWidgets[bindingPath].push(bindingInfo)
            }
        }
    }
    ;
    Data.prototype.__hasBindingInfo = function(path, info) {
        var widgets = this.__boundWidgets[path];
        for (var i = 0, len = widgets.length; i < len; i++) {
            if (widgets[i].widgetId === info.widgetId && widgets[i].property === info.property && widgets[i].valuePath === info.valuePath) {
                return true
            }
        }
        return false
    }
    ;
    Data.prototype.__updateBoundWidgets = function(key, __fromWidgetId) {
        if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
            for (var i = 0, len = key.length; i < len; i++) {
                this.__updateBoundWidgetsImpl(key[i], __fromWidgetId)
            }
        } else {
            this.__updateBoundWidgetsImpl(key, __fromWidgetId)
        }
    }
    ;
    Data.prototype.__updateBoundWidgetsImpl = function(key, __fromWidgetId) {
        var key = this.__searchBoundKey(key);
        if (this.__boundWidgets && this.__boundWidgets[key]) {
            var bindingInfoList = this.__boundWidgets[key];
            for (var i = 0, len = bindingInfoList.length; i < len; i++) {
                var bindingInfo = bindingInfoList[i];
                if (__fromWidgetId && bindingInfo['widgetId'] == __fromWidgetId)
                    continue;
                var widget = TopUI.Dom.selectById(bindingInfo['widgetId']);
                if (bindingInfo['__isInitCalled'] === undefined)
                    bindingInfo['__isInitCalled'] = true;
                var prop = bindingInfo['property'];
                var value = prop === 'items' ? this.getValue(bindingInfo['valuePath'].split('+')[0]) : this.getValue(bindingInfo['valuePath']);
                var obj = {};
                obj[prop] = value;
                if (widget)
                    widget.setProperties(obj)
            }
        }
    }
    ;
    Data.prototype.__searchBoundKey = function(key) {
        var parts = key.split('.');
        var path = key;
        var boundKey = '';
        if (this.__boundWidgets[path]) {
            boundKey = path
        } else {
            for (var i = 1, len = parts.length; i < len; i++) {
                var pos = path.lastIndexOf(parts[len - i]);
                path = path.substring(0, pos - 1);
                if (this.__boundWidgets[path] && this.__hasValuePath(this.__boundWidgets[path], path)) {
                    boundKey = path;
                    break
                }
            }
        }
        return boundKey
    }
    ;
    Data.prototype.__hasValuePath = function(list, valuePath) {
        for (var i = 0, len = list.length; i < len; i++) {
            if (list[i].valuePath == valuePath) {
                return true
            }
        }
        return false
    }
    ;
    Data.prototype.getValues = function() {
        var values = {};
        var keys = Object.keys(this);
        for (var i = 0, len = keys.length; i < len; i++) {
            if (keys[i] != 'id' && keys[i] != '__boundWidgets' && keys[i] != '__initialValues' && keys[i] != '__isBackward' && typeof this[keys[i]] !== 'function') {
                values[keys[i]] = JSON.parse(JSON.stringify(this[keys[i]]))
            }
        }
        return values
    }
    ;
    Data.prototype.getValue = function(path) {
        if (this.__isBackward) {
            if (!path.startsWith('data.'))
                path = 'data.' + path
        }
        var value = this;
        var arrPath = path.split('.');
        for (var i = 0, len = arrPath.length; i < len; i++) {
            if (value[arrPath[i]] !== undefined) {
                value = value[arrPath[i]]
            } else {
                return
            }
        }
        return value
    }
    ;
    Data.prototype.__getValueWithConverter = function(path) {
        var fields = path.split('+')[0];
        var converter = TopUI.Util.namespace(path.split('+')[1]);
        var value = this.getValue(fields);
        if (typeof converter.convert === 'function') {
            return converter.convert(value)
        } else {
            return value
        }
    }
    ;
    Data.prototype.getData = function(keys) {
        return this[keys]
    }
    ;
    Data.prototype.setData = function(values) {
        if (this.__isBackward) {
            var keys = Object.keys(values);
            for (var i = 0, len = keys.length; i < len; i++) {
                this['data'][keys[i]] = values[keys[i]]
            }
            this.__updateBoundWidgets('data.' + keys)
        } else if (arguments.length === 2 && typeof arguments[0] === 'string' && _typeof(arguments[1]) === 'object') {
            this.setValue(arguments[0], arguments[1])
        } else {
            this.setValues(values)
        }
        this.__updateRelationsBinding()
    }
    ;
    Data.prototype.setValues = function(values) {
        var keys = Object.keys(values);
        for (var i = 0, len = keys.length; i < len; i++) {
            if (keys[i] != 'id' && keys[i] != '__boundWidgets' && keys[i] != '__initialValues') {
                this[keys[i]] = values[keys[i]]
            }
        }
        this.__updateBoundWidgets(keys);
        this.__updateRelationsBinding()
    }
    ;
    Data.prototype.setValue = function(path, value, __fromWidgetId) {
        if (this.__isBackward && !path.startsWith('data.')) {
            path = 'data.' + path
        }
        var arrPath = path.split('.');
        var base = this;
        for (var i = 0, len = arrPath.length - 1; i < len; i++) {
            base = base[arrPath[i]] = base[arrPath[i]] || {}
        }
        base[arrPath[len]] = value;
        this.__updateBoundWidgets(path, __fromWidgetId);
        this.__updateRelationsBinding()
    }
    ;
    Data.prototype.addValue = function(path, value) {
        if (this.__isBackward && !path.startsWith('data.')) {
            path = 'data.' + path
        }
        var arrPath = path.split('.');
        var base = this;
        for (var i = 0, len = arrPath.length - 1; i < len; i++) {
            base = base[arrPath[i]] = base[arrPath[i]] || {}
        }
        if (Array.isArray(base[arrPath[len]])) {
            if (value instanceof TopUI.Data) {
                base[arrPath[len]].push(value.getValues())
            } else {
                base[arrPath[len]].push(value)
            }
        }
        this.__updateBoundWidgets(path);
        this.__updateRelationsBinding()
    }
    ;
    Data.prototype.removeValue = function(path, index) {
        if (this.__isBackward && !path.startsWith('data.')) {
            path = 'data.' + path
        }
        var arrPath = path.split('.');
        var base = this;
        for (var i = 0, len = arrPath.length - 1; i < len; i++) {
            base = base[arrPath[i]] = base[arrPath[i]] || {}
        }
        if (this.__isBackward && index >= 0) {
            base[arrPath[len]].splice(index, 1)
        } else {
            if (Array.isArray(base)) {
                base.splice(arrPath[len], 1)
            } else {
                delete base[arrPath[len]]
            }
        }
        this.__updateBoundWidgets(path);
        this.__updateBoundDevices(path);
        this.__updateRelationsBinding()
    }
    ;
    Data.prototype.reset = function(path) {
        if (typeof path === 'string') {
            if (this.__isBackward && !path.startsWith('data.')) {
                path = 'data.' + path
            }
            var arrPath = path.split('.');
            var base = this;
            var initialBase = JSON.parse(JSON.stringify(this.__initialValues));
            for (var i = 0, len = arrPath.length - 1; i < len; i++) {
                base = base[arrPath[i]] = base[arrPath[i]] || {};
                initialBase = initialBase[arrPath[i]] = initialBase[arrPath[i]] || {}
            }
            base[arrPath[len]] = initialBase[arrPath[len]];
            this.__updateBoundWidgets(path)
        } else {
            var keys = Object.keys(this.__initialValues);
            for (var i = 0, len = keys.length; i < len; i++) {
                this[keys[i]] = this.__initialValues[keys[i]]
            }
            this.__updateBoundWidgets(keys)
        }
        this.__updateRelationsBinding()
    }
    ;
    Data.prototype.update = function(path) {
        if (typeof path === 'string') {
            this.__updateBoundWidgets(path)
        }
        this.__updateRelationsBinding()
    }
    ;
    Data.prototype.setModel = function(field, modelId) {
        var arrPath = field.split('.');
        var obj;
        if (arrPath.length == 1) {
            this.__modelInfo[arrPath[0]] = {};
            this.__modelInfo[arrPath[0]]['modelId'] = modelId
        } else {
            if (this.__modelInfo[arrPath[0]])
                obj = this.__modelInfo[arrPath[0]];
            else {
                this.__modelInfo[arrPath[0]] = {};
                obj = this.__modelInfo[arrPath[0]]
            }
            for (var i = 1, len = arrPath.length - 1; i < len; i++) {
                if (obj[arrPath[i]] === undefined) {
                    obj[arrPath[i]] = {}
                }
                obj = obj[arrPath[i]]
            }
            obj[arrPath[len]] = {};
            obj[arrPath[len]]['modelId'] = modelId
        }
    }
    ;
    Data.prototype.getModel = function() {
        return this.__modelInfo
    }
    ;
    Data.prototype.setRelations = function(relations) {
        this.relations = relations
    }
    ;
    Data.prototype.getRelations = function() {
        return this.relations
    }
    ;
    Data.prototype.getDataByRelations = function(relationsId) {
        var relations = this.getRelationsById(relationsId);
        if (this[this.__toInstanceId(relationsId)] === undefined) {
            this[this.__toInstanceId(relationsId)] = this.__makeDataByRelations(relations)
        }
        return this.__toInstanceId(relationsId)
    }
    ;
    Data.prototype.getRelationsById = function(relationsId) {
        for (var i = 0, len = this.relations.length; i < len; i++) {
            if (this.relations[i].id === relationsId) {
                return this.relations[i]
            }
        }
    }
    ;
    Data.prototype.__makeDataByRelations = function(relations) {
        var relation = relations.Relation;
        var rootId = relation[0].parentId;
        var path = rootId;
        for (var i = 0, len = relation.length; i < len; i++) {
            if (rootId === relation[i].childId) {
                rootId = relation[i].parentId;
                path = rootId.concat('.').concat(path)
            } else {
                path = path.concat('.').concat(relation[i].childId)
            }
            var _this = this;
            var parents = JSON.parse(JSON.stringify(this.getValue(rootId)));
            parents.forEach(function(parent) {
                var children = _this.getValue(relation[i].childId);
                children.forEach(function(child) {
                    if (parent[relation[i].parentField] === child[relation[i].childField]) {
                        if (_typeof(parent[relation[i].childId]) !== 'object')
                            parent[relation[i].childId] = [];
                        parent[relation[i].childId].push(JSON.parse(JSON.stringify(child)))
                    }
                })
            })
        }
        relations.rootId = rootId;
        this.__setRelationModel(path);
        this.__modelInfo[this.__toInstanceId(relations.id)] = this.getModel()[rootId];
        return parents
    }
    ;
    Data.prototype.__setRelationModel = function(path) {
        var keys = path.split('.');
        var key = keys[0];
        this.setModel(key, this.getModel()[keys[0]].modelId);
        for (var i = 1, len = keys.length; i < len; i++) {
            key = key.concat('.').concat(keys[i]);
            this.setModel(key, this.getModel()[keys[i]].modelId)
        }
    }
    ;
    Data.prototype.getRootId = function(relationsId) {
        for (var i = 0, len = this.relations.length; i < len; i++) {
            if (this.relations[i].id === relationsId) {
                return this.relations[i].rootId
            }
        }
    }
    ;
    Data.prototype.__toInstanceId = function(relationsId) {
        return '__relations__'.concat(relationsId)
    }
    ;
    Data.prototype.__updateRelationsBinding = function() {
        var relations = this.getRelations();
        if (relations !== undefined) {
            for (var i = 0, len = relations.length; i < len; i++) {
                var instanceId = this.__toInstanceId(relations[i].id);
                this[instanceId] = this.__makeDataByRelations(relations[i]);
                this.__updateBoundWidgets(instanceId)
            }
        }
    }
    ;
    Data.prototype.__clearBindingInfo = function(valuePath, widgetId) {
        valuePath = valuePath.split('+')[0];
        var parts = valuePath.split('.');
        var bindingPath = parts[0];
        var bindingInfoList = this.__boundWidgets[bindingPath];
        if (bindingInfoList === undefined)
            return;
        for (var i = bindingInfoList.length - 1; i >= 0; i--) {
            if (bindingInfoList[i].widgetId === widgetId) {
                bindingInfoList.splice(i, 1)
            }
        }
        for (var j = 1, len2 = parts.length; j < len2; j++) {
            bindingPath += '.' + parts[j];
            bindingInfoList = this.__boundWidgets[bindingPath];
            for (var i = bindingInfoList.length - 1; i >= 0; i--) {
                if (bindingInfoList[i].widgetId === widgetId) {
                    bindingInfoList.splice(i, 1)
                }
            }
        }
    }
    ;
    Data.prototype.map = function(callback) {
        var data = this.getValues();
        delete data['__name'];
        var array = Object.values(data);
        return array.map(function(item, index, array) {
            return callback(item, index, array)
        })
    }
    ;
    Data.__modelList = {};
    Data.createModel = function(packageName, id, dataFields) {
        this.__modelList[id] = dataFields;
        this.createClass(packageName, id, Object.keys(dataFields))
    }
    ;
    Data.getDataModel = function(id) {
        return this.__modelList[id]
    }
    ;
    Data.__classList = {};
    Data.createClass = function(packageName, id, fieldNames) {
        var paths = packageName.split('.');
        var path = paths[0];
        window[path] = window[path] || {};
        var pkg = window[path];
        for (var i = 1, len = paths.length; i < len; i++) {
            pkg[paths[i]] = pkg[paths[i]] || {};
            pkg = pkg[paths[i]]
        }
        pkg[id] = {};
        pkg[id].class = id;
        for (var i = 0, len = fieldNames.length; i < len; i++) {
            pkg[id][fieldNames[i]] = ''
        }
        this.__classList[id] = pkg[id]
    }
    ;
    Data.getClass = function(className) {
        return this.__classList[className]
    }
    ;
    Data.toTreeNodes = function(origin, keyMap) {
        if (!keyMap.hasOwnProperty('id') || !keyMap.hasOwnProperty('level'))
            return;
        var data = [];
        var lowData = {};
        var rootLevel = 1;
        for (var i = 0, len = origin.length; i < len; i++) {
            if (origin[i][keyMap.level] === 0 || origin[i][keyMap.level] === '0') {
                rootLevel = 0;
                break
            }
        }
        for (i = 0,
        len = origin.length; i < len; i++) {
            var level = Number.isInteger(origin[i][keyMap.level]) === true ? origin[i][keyMap.level] : parseInt(origin[i][keyMap.level]);
            if (level === rootLevel) {
                data.push({
                    id: origin[i][keyMap.id],
                    text: origin[i][keyMap.text]
                });
                this.__copyProperties(data[data.length - 1], origin[i], keyMap)
            } else if (level > rootLevel) {
                if (lowData[level] === undefined)
                    lowData[level] = [];
                lowData[level].push(origin[i])
            }
        }
        var levels = Object.keys(lowData);
        for (i = 0,
        len = levels.length; i < len; i++) {
            var curData = lowData[levels[i]];
            for (var j = 0, len2 = curData.length; j < len2; j++) {
                var parent = this.__searchObjectById(data, curData[j][keyMap.parentId]);
                if (parent !== undefined) {
                    this.__addChildNode(parent, curData[j], keyMap)
                }
            }
        }
        return data
    }
    ;
    Data.syncTreeNodes = function(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            syncChildren(nodes[i].children, nodes[i])
        }
        function syncChildren(childrenArr, upperNode) {
            var childrenLength = childrenArr.length;
            var currentPath = '';
            if (upperNode.path == '') {
                currentPath = upperNode.id
            } else {
                currentPath = upperNode.path + '.' + upperNode.id
            }
            var currentLevel = parseInt(upperNode.level) + 1;
            for (var i = 0; i < childrenLength; i++) {
                var currentNode = childrenArr[i];
                currentNode.path = currentPath;
                currentNode.level = currentLevel;
                currentNode.parentId = upperNode.id;
                var childrenOfcurrentNode = currentNode.children;
                if (childrenOfcurrentNode != null && (typeof childrenOfcurrentNode === 'undefined' ? 'undefined' : _typeof(childrenOfcurrentNode)) == 'object' && childrenOfcurrentNode.length >= 1) {
                    syncChildren(childrenOfcurrentNode, currentNode)
                }
            }
        }
    }
    ;
    Data.__addChildNode = function(parent, child, keyMap) {
        if (parent.children === undefined) {
            parent.children = []
        }
        if (child[keyMap.seq]) {
            var index = parseInt(child[keyMap.seq]) - 1;
            parent.children.splice(index, 0, {
                id: child[keyMap.id],
                text: child[keyMap.text]
            });
            var i = parent.children.length <= index ? parent.children.length - 1 : index;
            this.__copyProperties(parent.children[i], child, keyMap)
        } else {
            parent.children.push({
                id: child[keyMap.id],
                text: child[keyMap.text]
            });
            this.__copyProperties(parent.children[parent.children.length - 1], child, keyMap)
        }
    }
    ;
    Data.__searchObjectById = function(array, id) {
        var result;
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i].id === id) {
                return array[i]
            } else if (_typeof(array[i].children) === 'object') {
                result = this.__searchObjectById(array[i].children, id);
                if (result) {
                    return result
                }
            }
        }
    }
    ;
    Data.__copyProperties = function(target, source, keyMap) {
        var keys = Object.keys(keyMap);
        for (var i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            if (key !== 'id' && key !== 'text' && key !== 'children') {
                target[keys[i]] = source[keyMap[keys[i]]]
            }
        }
    }
    ;
    return Data
}();
TopUI.Dom = function() {
    Dom.prototype = Object.create(TopUI.prototype);
    Dom.prototype.constructor = Dom;
    function Dom() {}
    Dom.__selectImpl = function(element) {
        var key = Object.keys(element).find(function(key) {
            return key.startsWith('__reactInternalInstance$')
        });
        var internalInstance = element[key];
        if (internalInstance == null)
            return null;
        if (internalInstance.return) {
            return internalInstance._debugOwner ? internalInstance._debugOwner.stateNode : internalInstance.return.stateNode
        } else {
            return internalInstance._currentElement._owner._instance
        }
    }
    ;
    Dom.selectById = function(id) {
        if (!id || id === '')
            return null;
        if (!document.getElementById(id))
            return null;
        return TopUI.Widget.create(this.__selectImpl(document.getElementById(id)).props.tagName, undefined, undefined, this.__selectImpl(document.getElementById(id)))
    }
    ;
    return Dom
}();
TopUI.Ajax = function() {
    Ajax.prototype = Object.create(TopUI.prototype);
    Ajax.prototype.constructor = Ajax;
    function Ajax() {}
    Ajax.execute = function(url, settings) {
        if ((typeof url === 'undefined' ? 'undefined' : _typeof(url)) === 'object' && typeof settings === 'undefined') {
            var settings = url;
            url = settings.url
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
            url += TopUI.Ajax.toQueryString(settings.data)
        }
        var xhr = new XMLHttpRequest;
        xhr.open(type, url, async);
        if (async)
            xhr.responseType = responseType;
        if (_headers !== undefined && _headers !== null && (typeof _headers === 'undefined' ? 'undefined' : _typeof(_headers)) === 'object') {
            for (i in _headers) {
                xhr.setRequestHeader(i, _headers[i])
            }
        }
        if (_beforeSend !== undefined && typeof _beforeSend === 'function') {
            var result = _beforeSend(xhr);
            if (result !== undefined && !result) {
                return false
            }
        }
        var contentType = typeof settings.contentType === 'string' ? settings.contentType : 'application/json';
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.onload = function() {
            if (xhr.status === 200) {
                if (typeof xhr.response === 'string' && !xhr.response.startsWith('<') && typeof settings.response === 'string') {
                    var dataName = TopUI.Util.getDataName(settings.response);
                    if (dataName) {
                        var dataObj = TopUI.Util.namespace(dataName);
                        if (dataObj instanceof TopUI.Data) {
                            var path = settings.response.split(dataName + '.')[1];
                            dataObj.setValue(path, xhr.response)
                        }
                    }
                }
                if (typeof _success === 'function')
                    _success(xhr.response, xhr.status, xhr)
            } else {
                if (typeof _error === 'function')
                    _error(xhr, xhr.status)
            }
            if (typeof _complete === 'function')
                _complete(xhr, xhr.status)
        }
        ;
        if ((type.toLowerCase() === 'post' || type.toLowerCase() === 'put' || type.toLowerCase() === 'delete') && settings.data) {
            var data = typeof settings.data === 'string' ? settings.data : JSON.stringify(settings.data);
            xhr.send(data)
        } else {
            xhr.send()
        }
    }
    ;
    Ajax.executeById = function(id) {
        TopUI.Dom.selectById(id).execute()
    }
    ;
    Ajax.get = function(url, request, response, onSuccess, onFail) {
        var settings = {};
        settings.type = 'get';
        settings.data = request;
        settings.response = response;
        settings.success = onSuccess;
        settings.error = onFail;
        this.execute(url, settings)
    }
    ;
    Ajax.post = function(url, request, response, onSuccess, onFail) {
        var settings = {};
        settings.type = 'post';
        settings.data = request;
        settings.response = response;
        settings.success = onSuccess;
        settings.error = onFail;
        this.execute(url, settings)
    }
    ;
    Ajax.toQueryString = function(data) {
        if (typeof data === 'string') {
            return '?' + data
        } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
            return '?' + $.param(data)
        }
    }
    ;
    return Ajax
}();
TopUI.Util = function() {
    Util.prototype = Object.create(TopUI.prototype);
    Util.prototype.constructor = Util;
    Util.propertyAliases = {};
    function Util() {}
    Util.guid = function() {
        return 'zxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0
              , v = c === 'x' ? r : r & 3 | 8;
            return v.toString(16)
        })
    }
    ;
    Util.__initLibsPath = function() {
        var file = document.getElementById('top.js');
        if (!file)
            return;
        var path = file.src;
        var fileName = TopUI.Util.getFileName(path);
        TopUI.libsPath = path.split(fileName)[0]
    }
    ;
    Util.__initVersion = function() {
        TopUI.Ajax.execute(TopUI.libsPath + 'version', {
            success: function success(data) {
                TopUI.setVersion(data)
            }
        })
    }
    ;
    Util.getFileExtension = function(fileName) {
        return fileName.split('.').pop()
    }
    ;
    Util.getFileName = function(path) {
        return path.split(/(\\|\/)/g).pop()
    }
    ;
    Util.namespace = function(string, widget) {
        if (!string) {
            return undefined
        } else if (typeof string !== 'string') {
            return null
        } else {
            return this.__stringToObject(string, widget)
        }
    }
    ;
    Util.getDataName = function(path, widget) {
        var parts = path.split('.');
        var dataName = '';
        for (var i = 0, len = parts.length; i < len; i++) {
            if (dataName === '') {
                dataName = dataName.concat(parts[i])
            } else {
                dataName = dataName.concat('.' + parts[i])
            }
            if (TopUI.Util.namespace(dataName, widget)instanceof TopUI.Data) {
                return dataName
            }
        }
        return ''
    }
    ;
    Util.__stringToObject = function(str, widget, __originWidet) {
        return this.__searchObject(window, str)
    }
    ;
    Util.__searchObject = function(base, str) {
        var object = base;
        var parts = str.split('.');
        for (var i = 0; i < parts.length; i++) {
            if (typeof object[parts[i]] === 'undefined') {
                return undefined
            }
            object = object[parts[i]]
        }
        return object
    }
    ;
    Util.toCamelCase = function(string) {
        return string.replace(/-([a-z])/g, function(g) {
            return g[1].toUpperCase()
        })
    }
    ;
    Util.toDash = function(string) {
        return string.replace(/([A-Z])/g, function($1) {
            return '-' + $1.toLowerCase()
        })
    }
    ;
    Util.capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }
    ;
    Util.__isStyleProperty = function(property) {
        var styleRegexp = /^(opacity|background|backgroundColor|backgroundImage|tileMode|maxWidth|minWidth|maxHeight|minHeight|lineHeight|padding|margin|visible|display|zIndex|float|position|horizontalAlignment|verticalAlignment|layoutHorizontalAlignment|layoutVerticalAlignment|layoutHeight|layoutWidth|layoutTop|layoutLeft|layoutRight|layoutBottom|borderWidth|borderBottomWidth|borderLeftWidth|borderRightWidth|borderTopWidth|borderStyle|borderColor|borderRadius|verticalScroll|horizontalScroll|textSize|textColor)$/;
        return styleRegexp.test(property)
    }
    ;
    Util.__isTopWidget = function(tagName) {
        if (tagName) {
            var name = tagName.toLowerCase()
        }
        return /^top-[a-zA-Z]*/.test(name) && TopUI.Render.topWidgets[name] !== undefined || TopUI.Render.topWidgets[name] !== undefined && TopUI.Render.topWidgets[name].isCustomType === true
    }
    ;
    Util.__getRawValue = function(str) {
        if (str.startsWith('@raw')) {
            str = str.split('?')[0];
            var id = str.substr(str.indexOf('/') + 1);
            return TopUI.RawManager.get(id.split('.')[0])
        } else {
            return str
        }
    }
    ;
    Util.__getPropConfigs = function(widget) {
        return eval(TopUI.Util.capitalizeFirstLetter(TopUI.Util.toCamelCase(widget.props.tagName)) + 'UI').propConfigs
    }
    ;
    Util.__validateProperties = function(key, value, config) {
        var convertedValue = value;
        if (config.type === undefined) {
            return convertedValue
        }
        if (config.type instanceof Array) {
            var returnFlag = true;
            for (var i = 0; i < config.type.length; i++) {
                if ((typeof convertedValue === 'undefined' ? 'undefined' : _typeof(convertedValue)) === _typeof(config.type[i]())) {
                    config.type = config.type[i];
                    returnFlag = false;
                    break
                }
                if (_typeof(config.type[i]()) === 'object') {
                    if (typeof convertedValue === 'string' && (convertedValue.startsWith('{') || convertedValue.startsWith('['))) {
                        config.type = config.type[i];
                        returnFlag = false;
                        break
                    }
                }
            }
            if (returnFlag)
                return convertedValue
        }
        if (_typeof(config.type()) === 'object') {
            return TopUI.Util.__validateObjectProperty(key, value, config)
        }
        if ((typeof convertedValue === 'undefined' ? 'undefined' : _typeof(convertedValue)) !== _typeof(config.type())) {
            console.warn('PropertyWarning: type of property \'' + key + '\' given as \'' + TopUI.Util.capitalizeFirstLetter(typeof convertedValue === 'undefined' ? 'undefined' : _typeof(convertedValue)) + '\' should be \'' + TopUI.Util.capitalizeFirstLetter(_typeof(config.type())) + '\'. Automatically changed to \'' + TopUI.Util.capitalizeFirstLetter(_typeof(config.type())) + '\'.');
            if (typeof config.type() === 'boolean') {
                if (convertedValue === 'true')
                    convertedValue = true;
                else if (convertedValue === 'false')
                    convertedValue = false;
                else
                    convertedValue = config.type(convertedValue)
            } else {
                convertedValue = config.type(convertedValue)
            }
        }
        if (config.options && config.options.indexOf(convertedValue) < 0) {
            console.warn('PropertyWarning: property \'' + key + '\' given as \'' + convertedValue + '\' should be one of [' + config.options + ']. ' + 'Automatically changed to \'' + config.default + '\'.');
            convertedValue = config.default
        }
        if (config.convert && typeof config.convert === 'function') {
            convertedValue = config.convert(convertedValue)
        }
        return convertedValue
    }
    ;
    Util.__validateObjectProperty = function(prop, object, config) {
        function printWarning(key, prop, shape) {
            if (!shape) {
                console.warn('PropertyWarning: property \'' + prop + '\' has no config.')
            } else if (key) {
                console.warn('PropertyWarning: key \'' + key + '\' is not suitable key for property \'' + prop + '\'.')
            } else {
                console.warn('PropertyWarning: \'' + object + '\' is not object for property \'' + prop + '\'.')
            }
        }
        var convertedObject = object;
        if ((typeof convertedObject === 'undefined' ? 'undefined' : _typeof(convertedObject)) !== _typeof(config.type())) {
            if (typeof convertedObject === 'string') {
                if (convertedObject.startsWith('{') || convertedObject.startsWith('[')) {
                    try {
                        convertedObject = JSON.parse(convertedObject)
                    } catch (e) {
                        convertedObject = eval('(' + convertedObject + ')')
                    }
                } else {
                    convertedObject = TopUI.Util.namespace(convertedObject) || convertedObject
                }
                if ((typeof convertedObject === 'undefined' ? 'undefined' : _typeof(convertedObject)) !== _typeof(config.type())) {
                    printWarning(null, prop);
                    convertedObject = [convertedObject]
                }
            } else if (typeof convertedObject === 'number') {
                convertedObject = [convertedObject]
            }
        }
        if (convertedObject instanceof Array) {
            for (var i = 0; i < convertedObject.length; i++) {
                if (!config.arrayOf)
                    break;
                convertedObject[i] = config.arrayOf(convertedObject[i])
            }
        } else {
            for (var key in convertedObject) {
                if (!config.shape) {
                    printWarning(key, prop, null);
                    break
                }
                if (!config.shape[key]) {
                    printWarning(key, prop);
                    continue
                }
                convertedObject[key] = TopUI.Util.__validateProperties(key, convertedObject[key], config.shape[key])
            }
        }
        console.log('final result: ', convertedObject);
        return convertedObject
    }
    ;
    Util.__gatherPropertyAliases = function() {
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
                                TopUI.Util.propertyAliases[alias] = prop
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return()
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    ;
    Util.__setDefaultProperties = function(properties, configs) {
        var newState = Object.assign({}, properties);
        for (var key in configs) {
            if (!newState[key] && configs[key].default !== undefined) {
                console.warn('PropertyWarning: property \'' + key + '\' given as \'' + newState[key] + '\' should have value. ' + 'Automatically changed to \'' + configs[key].default + '\'.');
                newState[key] = configs[key].default
            }
        }
        return newState
    }
    ;
    Util.__convertProperties = function(properties, configs) {
        var convertedProperties = {};
        if (configs) {
            var __configs = $.extend(true, {}, configs)
        }
        var keys = Object.keys(properties);
        for (var i = 0, len = keys.length; i < len; i++) {
            var attrName = keys[i];
            if (attrName.includes('-')) {
                attrName = attrName.replace(/-([a-z])/g, function(g) {
                    return g[1].toUpperCase()
                })
            }
            if (TopUI.Util.propertyAliases[attrName]) {
                console.warn('PropertyWarning: property \'' + attrName + '\' is an alias of \'' + TopUI.Util.propertyAliases[attrName] + '\'. Automatically changed to \'' + TopUI.Util.propertyAliases[attrName] + '\'.');
                convertedProperties[TopUI.Util.propertyAliases[attrName]] = properties[keys[i]];
                properties[TopUI.Util.propertyAliases[attrName]] = properties[keys[i]];
                attrName = TopUI.Util.propertyAliases[attrName]
            } else {
                convertedProperties[attrName] = properties[keys[i]]
            }
            if (configs && configs[attrName]) {
                convertedProperties[attrName] = TopUI.Util.__validateProperties(attrName, convertedProperties[attrName], __configs[attrName])
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
                        break
                    }
                case '@raw':
                    {
                        modifiedValue = TopUI.RawManager.get(resourceId);
                        break
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
                                break
                            }
                        case '@color':
                            {
                                modifiedValue = TopUI.ValuesManager.get('colors', resourceId)[resourceName];
                                break
                            }
                        case '@dimen':
                            {
                                modifiedValue = TopUI.ValuesManager.get('dimen', resourceId)[resourceName];
                                break
                            }
                        }
                    }
                }
                convertedProperties[attrName] = modifiedValue
            }
        }
        return convertedProperties
    }
    ;
    Util.__addClassToClassList = function(classList, classString, toggleClassList) {
        if (toggleClassList)
            toggleClassList.forEach(function(c) {
                if (classList.indexOf(c) > 0)
                    classList.splice(classList.indexOf(c), 1)
            });
        if (classString && !classList.includes(classString))
            classList.push(classString);
        return classList
    }
    ;
    Util.__classListToClassString = function(array) {
        var str = '';
        for (var i = 0; i < array.length; i++) {
            if (i === 0)
                str = array[i];
            else
                str = str + ' ' + array[i]
        }
        return str
    }
    ;
    Util.__classStringToClassList = function(classString, classList) {
        if (!classList)
            var classList = [];
        if (classString)
            classString.split(' ').forEach(function(c) {
                if (!classList.includes(c))
                    classList.push(c)
            });
        return classList
    }
    ;
    return Util
}();
TopUI.DrawableManager = function() {
    DrawableManager.prototype = Object.create(TopUI.prototype);
    DrawableManager.prototype.constructor = DrawableManager;
    function DrawableManager() {}
    DrawableManager.__map = {};
    DrawableManager.create = function(obj) {
        Object.assign(DrawableManager.__map, obj)
    }
    ;
    DrawableManager.get = function(id) {
        return DrawableManager.__map[id]
    }
    ;
    return DrawableManager
}();
TopUI.RawManager = function() {
    RawManager.prototype = Object.create(TopUI.prototype);
    RawManager.prototype.constructor = RawManager;
    function RawManager() {}
    RawManager.__map = {};
    RawManager.create = function(obj) {
        var keys = Object.keys(obj);
        var newObj = {};
        for (var i = 0, len = keys.length; i < len; i++) {
            newObj[keys[i].split('.')[0]] = obj[keys[i]]
        }
        Object.assign(RawManager.__map, newObj)
    }
    ;
    RawManager.get = function(id) {
        return RawManager.__map[id]
    }
    ;
    return RawManager
}();
TopUI.ValuesManager = function() {
    ValuesManager.prototype = Object.create(TopUI.prototype);
    ValuesManager.prototype.constructor = ValuesManager;
    function ValuesManager() {}
    ValuesManager.__map = {
        'strings': {},
        'colors': {},
        'dimens': {}
    };
    ValuesManager.create = function(type, obj) {
        Object.assign(ValuesManager.__map[type], obj)
    }
    ;
    ValuesManager.get = function(type, id) {
        return ValuesManager.__map[type][id]
    }
    ;
    return ValuesManager
}();
TopUI.EventManager = function() {
    EventManager.prototype = Object.create(TopUI.prototype);
    EventManager.prototype.constructor = EventManager;
    EventManager.prototype.events = {};
    EventManager.prototype.eventList = {};
    EventManager.prototype.shortCut = false;
    function EventManager() {}
    EventManager.__findEvent = function(e, lastEventFlag) {
        var eventList = TopUI.EventManager.prototype.eventList;
        var type = e.type;
        var target = e.target;
        var callback = eventList[type].get(target);
        var event = $.extend({}, e);
        event.top_stop_propagation = false;
        event.stopPropagation = function() {
            this.top_stop_propagation = true
        }
        ;
        if (lastEventFlag) {
            TopUI.EventManager.lastEvent = target;
            lastEventFlag = false
        }
        if (callback) {
            callback(event)
        }
        if (event.top_stop_propagation || !event.target || !event.target.tagName) {
            return
        }
        if (event.path.length > 1) {
            event.target = event.path[1];
            event.path.shift()
        } else if (event.target.parentNode) {
            event.target = event.target.parentNode
        }
        lastEventFlag = event.target.tagName && event.target.tagName.startsWith('TOP') && lastEventFlag === undefined ? true : lastEventFlag;
        TopUI.EventManager.__findEvent(event, lastEventFlag)
    }
    ;
    EventManager.__findKeyEvent = function(e, lastEvent) {
        var eventList = TopUI.EventManager.prototype.eventList;
        var type = e.type;
        var target = e.target;
        var callback = eventList[type].get(target);
        var event = $.extend({}, e);
        if (!lastEvent && document.activeElement !== undefined && document.activeElement.tagName !== 'BODY') {
            lastEvent = EventManager.__findTopDom(document.activeElement)
        }
        if (lastEvent === undefined) {
            lastEvent = TopUI.EventManager.lastEvent
        }
        if (event.target.tagName === 'BODY') {
            event.target = lastEvent
        }
        event.top_stop_propagation = false;
        event.stopPropagation = function() {
            this.top_stop_propagation = true
        }
        ;
        if (callback) {
            callback(event)
        }
        if (!lastEvent || event.top_stop_propagation) {
            return
        }
        var dom = EventManager.__findTopDom(lastEvent.parentNode);
        if (dom === false) {
            return
        }
        EventManager.__findKeyEvent(event, dom)
    }
    ;
    EventManager.on = function(event, element, callback) {
        var eventList = TopUI.EventManager.prototype.eventList;
        var callbackFunc = event.startsWith('key') ? this.__findKeyEvent : this.__findEvent;
        document.addEventListener(event, callbackFunc);
        eventList[event] = this.prototype.eventList[event] || new Map;
        eventList[event].set(element, callback)
    }
    ;
    EventManager.off = function(event, element) {
        var eventList = TopUI.EventManager.prototype.eventList;
        eventList[event].delete(element);
        if (eventList[event].size <= 0) {
            document.removeEventListener(event, null)
        }
    }
    ;
    EventManager.__findTopDom = function(dom) {
        if (!dom || !dom.tagName) {
            return false
        }
        if (dom.tagName.startsWith('TOP')) {
            return dom
        }
        return this.__findTopDom(dom.parentNode)
    }
    ;
    EventManager.addShortcut = function(key, callback) {
        if (EventManager.prototype.shortCut === false) {
            EventManager.__addEvent('keydown', null, true);
            EventManager.prototype.shortCut = true
        }
        var events = EventManager.prototype.events;
        var keys = key.split('+');
        var new_key = new Array;
        for (var i = 0; i < keys.length; i++) {
            switch (keys[i].toLowerCase()) {
            case 'ctrl':
                new_key[0] = 'ctrl';
                break;
            case 'alt':
                new_key[1] = 'alt';
                break;
            case 'shift':
                new_key[2] = 'shift';
                break;
            default:
                if (parseInt(keys[i].toLowerCase()) > 300)
                    new_key[3] = parseInt(keys[i].toLowerCase());
                else
                    new_key[3] = keys[i].toLowerCase();
            }
        }
        new_key = new_key.filter(Boolean).toString();
        events[new_key] = callback
    }
    ;
    EventManager.__findShorcut = function(e) {
        var key_string = '';
        if (e.ctrlKey === true) {
            key_string += 'ctrl,'
        }
        if (e.altKey === true) {
            key_string += 'alt,'
        }
        if (e.shiftKey === true) {
            key_string += 'shift,'
        }
        if (e.keyCode > 47 && e.keyCode < 91) {
            key_string += String.fromCharCode(e.keyCode)
        } else {
            key_string += e.keyCode.toString()
        }
        key_string = key_string.toLowerCase();
        var events = EventManager.prototype.events;
        if (events[key_string] !== undefined) {
            var callback = events[key_string];
            callback(e)
        }
    }
    ;
    return EventManager
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopLayoutEditor = function(_React$Component) {
    _inherits(TopLayoutEditor, _React$Component);
    function TopLayoutEditor(props) {
        _classCallCheck(this, TopLayoutEditor);
        var _this = _possibleConstructorReturn(this, (TopLayoutEditor.__proto__ || Object.getPrototypeOf(TopLayoutEditor)).call(this, props));
        _this.state = {};
        for (var key in _this.props) {
            _this.state[key] = _this.props[key]
        }
        _this.layoutChild = [];
        TopUI.Render.LayoutEditorDom = _this;
        return _this
    }
    _createClass(TopLayoutEditor, [{
        key: 'getElement',
        value: function getElement() {
            return ReactDOM.findDOMNode(this).parentNode
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;
            var children = React.Children.map(this.state.children, function(child, index) {
                return React.cloneElement(child, {
                    index: index,
                    layoutParent: _this2,
                    layoutFunction: function layoutFunction() {}
                })
            });
            return children
        }
    }, {
        key: 'addWidget',
        value: function addWidget(widget) {
            this.setState(function(state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (widget.reactElement) {
                    changedchilds.push(widget.reactElement)
                } else {
                    changedchilds.push(React.createElement(TopUI.Render.topWidgets[widget.template.props.tagName], widget.template.state, widget.template.state.children))
                }
                return {
                    children: changedchilds
                }
            });
            if (!widget.template)
                widget.template = TopUI.Dom.__selectImpl(this.getElement().querySelector(widget.reactElement.props.tagName + '#' + widget.reactElement.props.id))
        }
    }, {
        key: 'removeWidget',
        value: function removeWidget(widget) {
            var _this3 = this;
            this.setState(function(state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (widget.reactElement && changedchilds.indexOf(widget.reactElement) > -1)
                    changedchilds.splice(changedchilds.indexOf(widget.reactElement), 1);
                else if (_this3.layoutChild.indexOf(widget.template) > -1)
                    changedchilds.splice(_this3.layoutChild.indexOf(widget.template), 1);
                return {
                    children: changedchilds
                }
            })
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.layoutChild = [];
            this.setState({
                children: []
            })
        }
    }]);
    return TopLayoutEditor
}(React.Component);
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopWidgetBehavior = function(_React$Component) {
    _inherits(TopWidgetBehavior, _React$Component);
    function TopWidgetBehavior(props) {
        _classCallCheck(this, TopWidgetBehavior);
        var _this2 = _possibleConstructorReturn(this, (TopWidgetBehavior.__proto__ || Object.getPrototypeOf(TopWidgetBehavior)).call(this, props));
        _this2.initState();
        _this2.initParent();
        _this2.topClassList = [];
        _this2.userClassList = [];
        _this2.userClassList = TopUI.Util.__classStringToClassList(_this2.state.class, _this2.userClassList);
        _this2.__initialClassname();
        _this2.setPropertiesCallback = [];
        return _this2
    }
    _createClass(TopWidgetBehavior, [{
        key: 'initState',
        value: function initState() {
            this.state = TopUI.Util.__setDefaultProperties(this.props, TopUI.Util.__getPropConfigs(this));
            this.state = TopUI.Util.__convertProperties(this.state, TopUI.Util.__getPropConfigs(this))
        }
    }, {
        key: 'initParent',
        value: function initParent() {
            if (this.props.layoutParent) {
                if (this.props.layoutParent.layoutChild.length <= this.props.index)
                    this.props.layoutParent.layoutChild.push(this);
                else {
                    this.props.layoutParent.layoutChild.splice(this.props.index, 0, this)
                }
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            console.log('Unmount', this.props.id);
            if (this.props.layoutParent) {
                if (this.props.layoutParent.layoutChild.indexOf(this) >= 0)
                    this.props.layoutParent.layoutChild.splice(this.props.layoutParent.layoutChild.indexOf(this), 1)
            }
        }
    }, {
        key: '__updateProperties',
        value: function __updateProperties(properties) {
            this.__updatePropertiesImpl(TopUI.Util.__convertProperties(properties, TopUI.Util.__getPropConfigs(this)))
        }
    }, {
        key: '__updatePropertiesImpl',
        value: function __updatePropertiesImpl(properties) {
            var _this = this;
            var keys = Object.keys(properties);
            for (var i = 0, len = keys.length; i < len; i++) {
                if (!this.isStateDifferent(keys[i], properties))
                    continue;
                (function(j) {
                    var funcName = '__update' + TopUI.Util.capitalizeFirstLetter(keys[j]);
                    if (typeof _this[funcName] === 'function') {
                        _this.setPropertiesCallback.push(function() {
                            _this[funcName]()
                        })
                    } else if (TopUI.Util.__isStyleProperty(keys[j])) {
                        _this.setPropertiesCallback.push(function() {
                            _this.updateStyle(keys[j])
                        })
                    }
                }
                )(i)
            }
            this.setState(function(state, props) {
                var newState = {};
                Object.assign(newState, state);
                for (var i = 0; i < keys.length; i++) {
                    newState[keys[i]] = properties[keys[i]]
                }
                return newState
            })
        }
    }, {
        key: 'addClassToTopClassList',
        value: function addClassToTopClassList(className) {
            if (!this.topClassList.includes(className)) {
                this.topClassList.push(className)
            }
        }
    }, {
        key: 'removeClassFromTopClassList',
        value: function removeClassFromTopClassList(className) {
            while (this.topClassList.includes(className)) {
                var index = this.topClassList.indexOf(className);
                this.topClassList.splice(index, 1)
            }
        }
    }, {
        key: 'makeTopTagClassString',
        value: function makeTopTagClassString() {
            var string = TopUI.Util.__classListToClassString(this.userClassList);
            var _this = this;
            this.topClassList.forEach(function(c) {
                if (!_this.userClassList.includes(c))
                    string = string + ' ' + c
            });
            return string
        }
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {}
    }, {
        key: '__updateClass',
        value: function __updateClass() {
            this.userClassList = [];
            this.userClassList = TopUI.Util.__classStringToClassList(this.state.class, this.userClassList);
            this.__initialClassname()
        }
    }, {
        key: 'getLayoutParent',
        value: function getLayoutParent() {
            return this.state.layoutParent
        }
    }, {
        key: 'getParent',
        value: function getParent() {
            return this.getLayoutParent()
        }
    }]);
    return TopWidgetBehavior
}(React.Component);
TopWidgetBehavior.propConfigs = {
    class: {
        type: String,
        aliases: ['className']
    }
};
TopWidgetBehavior.defaultProps = {};
TopUI.Widget = function() {
    Widget.prototype = Object.create(TopUI.prototype);
    Widget.prototype.constructor = Widget;
    function Widget() {}
    Widget.create = function(tagName, props, childs, __element) {
        var type = this.getType(tagName);
        var parentType = this.getParentType(type);
        if (parentType !== null) {
            var creator = TopUI.Widget[parentType][type]
        } else {
            var creator = TopUI.Widget[type]
        }
        if (typeof creator === 'function') {
            if (!props) {
                props = {
                    id: TopUI.Util.guid()
                }
            } else if (!props.id) {
                props.id = TopUI.Util.guid()
            }
            if (__element && __element.key)
                props.key = __element.key;
            else
                props.key = tagName.toUpperCase() + '-' + top_index;
            top_index++;
            if (childs === undefined) {
                props['children'] = [];
                childs = []
            }
            var widget = creator.create(__element, props, childs)
        } else {
            var customType = TopUI.Util.capitalizeFirstLetter(TopUI.Util.toCamelCase(tagName));
            if (TopUI.Widget[customType] !== undefined) {
                var widget = TopUI.Widget[customType].create(__element)
            } else {
                console.error('Type error: ' + tagName + ' is not defined.');
                return undefined
            }
        }
        return widget
    }
    ;
    Widget.getType = function(tagName) {
        if (TopUI.Render.topWidgets[tagName] === undefined) {
            return null
        } else if (tagName === 'top-graph-navigator') {
            return 'GraphNavigator'
        } else if (TopUI.Render.topWidgets[tagName].isCustomType) {
            return TopUI.Util.capitalizeFirstLetter(TopUI.Util.toCamelCase(tagName))
        } else if (tagName.startsWith('top-')) {
            return TopUI.Util.capitalizeFirstLetter(tagName.split('-')[1])
        } else {
            return null
        }
    }
    ;
    Widget.getParentType = function(type) {
        var layouts = ['Absolutelayout', 'Linearlayout', 'Framelayout', 'Docklayout', 'Gridlayout', 'Tablayout', 'Scrolllayout', 'Form', 'Foldinglayout', 'Layout', 'Splitterlayout', 'Flowlayout', 'Page'];
        var containers = ['Listview', 'Tableview', 'Selectbox', 'Treeview', 'Panel', 'Accordionlayout'];
        var groups = ['Imageslider', 'Widgetitem', 'Accordiontab'];
        var menu = ['Drawermenu', 'Contextmenu'];
        if (layouts.includes(type)) {
            return 'Layout'
        } else if (containers.includes(type)) {
            return 'Container'
        } else if (groups.includes(type)) {
            return 'Group'
        } else if (menu.includes(type)) {
            return 'Menu'
        } else {
            return null
        }
    }
    ;
    Widget.prototype.setProperties = function(properties) {
        if (this.template)
            this.template.__updateProperties(properties);
        if (this.reactElement) {
            this.reactElement = React.cloneElement(this.reactElement, TopUI.Util.__convertProperties(properties))
        }
    }
    ;
    Widget.prototype.getLayoutParent = function() {
        return this.template.getLayoutParent()
    }
    ;
    Widget.prototype.getParent = function() {
        return TopUI.Widget.create(this.template.getParent().props.tagName, undefined, undefined, this.template.getParent())
    }
    ;
    Widget.prototype.isAttached = function() {
        if (this.template && this.template.__isAttached === true)
            return true;
        return false
    }
    ;
    Widget.prototype.getElementForSize = function() {
        return this.template.getElementForSize()
    }
    ;
    Widget.prototype.getProperties = function(key) {
        if (key === undefined) {
            return Object.assign({}, this.template.state)
        }
        if (key.includes('-')) {
            key = key.replace(/-([a-z])/g, function(g) {
                return g[1].toUpperCase()
            })
        }
        if (!this.template)
            return undefined;
        if (key === 'data' && this.template.props.tagName === 'top-tableview')
            return this.getItems();
        if (this.template.state[key] !== undefined)
            return this.template.state[key];
        else
            return undefined
    }
    ;
    return Widget
}();
var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopElementBehavior = function(_TopWidgetBehavior) {
    _inherits(TopElementBehavior, _TopWidgetBehavior);
    function TopElementBehavior(props) {
        _classCallCheck(this, TopElementBehavior);
        var _this = _possibleConstructorReturn(this, (TopElementBehavior.__proto__ || Object.getPrototypeOf(TopElementBehavior)).call(this, props));
        _this.dom = {};
        _this.initDomRef();
        return _this
    }
    _createClass(TopElementBehavior, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            console.log('mount', this.props.id);
            this.__isAttached = true;
            if (typeof this.__layoutAttached === 'function')
                this.__layoutAttached();
            this.__componentDidMount();
            if (typeof this.state.onAttached === 'function')
                this.state.onAttached()
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _get(TopElementBehavior.prototype.__proto__ || Object.getPrototypeOf(TopElementBehavior.prototype), 'componentWillUnmount', this).call(this);
            this.__isAttached = false;
            this.__componentWillUnmount()
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            if (this.getLayoutParent() && this.getLayoutParent().shouldComplete) {
                this.getLayoutParent().complete();
                this.getLayoutParent().shouldComplete = false
            }
            this.__componentDidUpdate();
            console.log('Update', this.props.id)
        }
    }, {
        key: 'isStateDifferent',
        value: function isStateDifferent(key, nextState) {
            if (_typeof(this.state[key]) === 'object' && _typeof(nextState[key]) === 'object') {
                if (!objectCompare(this.state[key], nextState[key])) {
                    console.log('shouldUpdate', this.props.id);
                    return true
                }
            } else if (this.state[key] !== nextState[key]) {
                console.log('shouldUpdate', this.props.id);
                return true
            }
            function objectCompare(obj1, obj2) {
                try {
                    return JSON.stringify(obj1) === JSON.stringify(obj2)
                } catch (e) {
                    return obj1 === obj2
                }
            }
            return false
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            if (this.props.component !== nextProps.component) {
                this.setState(nextProps);
            }
            for (var key in nextState) {
                if (this.isStateDifferent(key, nextState)) {
                    return true
                }
            }
            return false
        }
    }, {
        key: 'getElement',
        value: function getElement() {
            return this.dom.root
        }
    }, {
        key: 'getElementForSize',
        value: function getElementForSize() {
            return this.getElement()
        }
    }, {
        key: 'initDomRef',
        value: function initDomRef() {
            var _this2 = this;
            this.dom.top = null;
            this.setTopRef = function(element) {
                _this2.dom.top = element
            }
            ;
            this.__initDomRef()
        }
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this3 = this;
            this.dom.root = null;
            this.setRootRef = function(element) {
                _this3.dom.root = element
            }
        }
    }, {
        key: 'render',
        value: function render() {
            console.log('render', this.props.id);
            if (this.reRenderFlag) {
                this.__componentWillUpdate()
            }
            this.reRenderFlag = true;
            for (var i = 0; i < this.setPropertiesCallback.length; i++) {
                this.setPropertiesCallback[i]()
            }
            this.setPropertiesCallback = [];
            if (typeof this.props.layoutFunction === 'function')
                this.props.layoutFunction.call(this);
            return this.__render()
        }
    }]);
    return TopElementBehavior
}(TopWidgetBehavior);
TopElementBehavior.propConfigs = Object.assign({}, TopWidgetBehavior.propConfigs, {});
TopElementBehavior.defaultProps = Object.assign({}, TopWidgetBehavior.defaultProps, {});
var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopDataBehavior = function(_TopElementBehavior) {
    _inherits(TopDataBehavior, _TopElementBehavior);
    function TopDataBehavior(props) {
        _classCallCheck(this, TopDataBehavior);
        var _this = _possibleConstructorReturn(this, (TopDataBehavior.__proto__ || Object.getPrototypeOf(TopDataBehavior)).call(this, props));
        _this.__isBoundData = {};
        _this.__initBoundData();
        return _this
    }
    _createClass(TopDataBehavior, [{
        key: '__initBoundData',
        value: function __initBoundData() {
            if (typeof this.state.data === 'string')
                this.state.dataModel = JSON.parse(this.state.data);
            if (typeof this.state.dataModel === 'string')
                this.state.dataModel = JSON.parse(this.state.dataModel);
            if (this.state.dataModel === undefined || this.state.dataModel === '')
                return;
            this.__boundData = {};
            var convertedDataModel = TopUI.Util.__convertProperties(this.state.dataModel, TopUI.Util.__getPropConfigs(this));
            for (var prop in convertedDataModel) {
                var valuePath = this.state.dataModel[TopUI.Util.toDash(prop)];
                var dataName = TopUI.Util.getDataName(valuePath, this);
                var data = TopUI.Util.namespace(dataName, this);
                var splitValues = valuePath.split(dataName + '.');
                if (splitValues.length > 1) {
                    splitValues.shift();
                    valuePath = splitValues.join(dataName + '.')
                } else {
                    valuePath = splitValues[1]
                }
                if (data === undefined || !data.hasOwnProperty('id'))
                    return;
                this.__addBoundData(prop, dataName, valuePath);
                if (valuePath.includes('+')) {
                    var converter = TopUI.Util.namespace(valuePath.split('+')[1], this);
                    this.__boundData['DataConverter'] = converter
                }
                if (prop === 'items') {
                    this.state[prop] = this.state.dataModel[TopUI.Util.toDash(prop)].split('+')[0]
                } else {
                    var originValue = data.getValue(valuePath.split('+')[0]);
                    originValue = this.__getValueByDataConverter(originValue);
                    this.state[prop] = originValue
                }
                this.state = TopUI.Util.__convertProperties(this.state);
                if (this.__isBoundData[prop] !== true) {
                    data.__addBoundWidget(valuePath, this.state.id, prop);
                    this.__isBoundData[prop] = true
                }
            }
        }
    }, {
        key: '__addBoundData',
        value: function __addBoundData(prop, dataName, valuePath) {
            var bindingInfo = {};
            bindingInfo.dataName = dataName;
            bindingInfo.valuePath = valuePath;
            this.__boundData[prop] = this.__boundData[prop] || [];
            this.__boundData[prop].push(bindingInfo)
        }
    }, {
        key: '__updateBoundData',
        value: function __updateBoundData(key, __widgetId) {
            if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                for (var i = 0, len = key.length; i < len; i++) {
                    this.__updateBoundDataImpl(key[i], __widgetId)
                }
            } else {
                this.__updateBoundDataImpl(key, __widgetId)
            }
        }
    }, {
        key: '__updateBoundDataImpl',
        value: function __updateBoundDataImpl(key, __widgetId) {
            if (this.__boundData && this.__boundData[key]) {
                var bindingInfoList = this.__boundData[key];
                for (var i = 0, len = bindingInfoList.length; i < len; i++) {
                    var data = TopUI.Util.namespace(bindingInfoList[i].dataName, this);
                    var valuePath = bindingInfoList[i].valuePath;
                    if (valuePath.includes('+')) {
                        valuePath = valuePath.split('+')[0]
                    }
                    if (key === 'items') {
                        if (typeof this[key] === 'string') {
                            data.setValue(valuePath, TopUI.Util.namespace(this.state[key], this), __widgetId)
                        } else {
                            data.setValue(valuePath, this.state[key], __widgetId)
                        }
                    } else {
                        var convertedValue = this[key];
                        if (this.__boundData['DataConverter']) {
                            var fnConvert = typeof this.__boundData['DataConverter'].convertBack === 'function' ? this.__boundData['DataConverter'].convertBack : this.__boundData['DataConverter'].convert;
                            convertedValue = fnConvert(this.state[key])
                        }
                        data.setValue(valuePath, convertedValue, __widgetId)
                    }
                }
            }
        }
    }, {
        key: 'updateData',
        value: function updateData(key) {
            if (this.__boundData) {
                if (key) {
                    this.__updateBoundData(key, this.id)
                } else {
                    var keys = Object.keys(this.__boundData);
                    this.__updateBoundData(keys, this.id)
                }
            }
        }
    }, {
        key: '__clearBindingInfo',
        value: function __clearBindingInfo() {
            if (_typeof(this.__boundData) === 'object') {
                var keys = Object.keys(this.__boundData);
                for (var i = 0, len = keys.length; i < len; i++) {
                    this.__isBoundData[keys[i]] = false;
                    var bindingInfoList = this.__boundData[keys[i]];
                    for (var j = 0, len = bindingInfoList.length; j < len; j++) {
                        var data = TopUI.Util.namespace(bindingInfoList[j].dataName, this);
                        var valuePath = bindingInfoList[j].valuePath;
                        if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object' && typeof data.__clearBindingInfo === 'function')
                            data.__clearBindingInfo(valuePath, this.id)
                    }
                }
            }
        }
    }, {
        key: '__updateData',
        value: function __updateData() {
            if (typeof this.state.data === 'string')
                this.state.dataModel = JSON.parse(this.state.data);
            if (typeof this.state.dataModel === 'string')
                this.state.dataModel = JSON.parse(this.state.dataModel);
            for (var prop in this.state.dataModel) {
                this.__isBoundData[prop] = undefined
            }
            this.__initBoundData(true)
        }
    }, {
        key: '__updateDataModel',
        value: function __updateDataModel() {
            if (typeof this.state.dataModel === 'string')
                this.state.dataModel = JSON.parse(this.state.dataModel);
            for (var prop in this.state.dataModel) {
                this.__isBoundData[prop] = undefined
            }
            this.__initBoundData(true)
        }
    }, {
        key: '__getValueByDataConverter',
        value: function __getValueByDataConverter(value, params) {
            if (!this.__boundData || this.__boundData && !this.__boundData['DataConverter'])
                return value;
            return this.__boundData['DataConverter'].convert(value, params)
        }
    }, {
        key: '__setValueByDataConverter',
        value: function __setValueByDataConverter(value, params) {
            if (!this.__boundData || this.__boundData && !this.__boundData['DataConverter'])
                return value;
            return this.__boundData['DataConverter'].convertBack(value, params)
        }
    }]);
    return TopDataBehavior
}(TopElementBehavior);
TopDataBehavior.propConfigs = Object.assign({}, TopElementBehavior.propConfigs, {});
TopDataBehavior.defaultProps = Object.assign({}, TopElementBehavior.defaultProps, {});
TopUI.Widget.Group = function() {
    Group.prototype = Object.create(TopUI.Widget.prototype);
    Group.prototype.constructor = Group;
    function Group() {}
    Group.prototype.is = "top-groupbehavior";
    return Group
}();
var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopCommonstyleBehavior = function(_TopDataBehavior) {
    _inherits(TopCommonstyleBehavior, _TopDataBehavior);
    function TopCommonstyleBehavior(props) {
        _classCallCheck(this, TopCommonstyleBehavior);
        var _this = _possibleConstructorReturn(this, (TopCommonstyleBehavior.__proto__ || Object.getPrototypeOf(TopCommonstyleBehavior)).call(this, props));
        _this.topTagStyle = {};
        _this.topStyle = {};
        _this[_this.getPaddingStyleObjectKey()] = {};
        _this.updateStyle();
        console.log('constructor', _this.props.id);
        return _this
    }
    _createClass(TopCommonstyleBehavior, [{
        key: 'updateStyle',
        value: function updateStyle(keys) {
            var layoutRenderFlag = false;
            if (keys != null && (typeof keys === 'undefined' ? 'undefined' : _typeof(keys)) === 'object') {
                for (var i = 0; i < keys.length; i++) {
                    if (!layoutRenderFlag) {
                        if (keys[i] === 'layoutAlignParent' || keys[i] === 'layoutRow' || keys[i] === 'layoutColumn' || keys[i] === 'layoutRowSpan' || keys[i] === 'layoutColumnSpan' || keys[i] === 'layoutTop' || keys[i] === 'layoutLeft' || keys[i] === 'layoutRight' || keys[i] === 'layoutBottom' || keys[i] === 'layoutTabName' || keys[i] === 'layoutTabIcon' || keys[i] === 'layoutTabDisabled' || keys[i] === 'layoutWeight' || keys[i] === 'layoutHorizontalAlignment' || keys[i] === 'layoutVerticalAlignment') {
                            layoutRenderFlag = true;
                            break
                        }
                    }
                }
                if (layoutRenderFlag) {}
            } else if (typeof keys === 'string') {
                var stylekeyMap = [['textColor', 'color'], ['textSize', 'fontSize'], ['horizontalAlignment', 'textAlign'], ['layoutVerticalAlignment', 'verticalAlign']];
                for (var j = 0; j < stylekeyMap.length; j++) {
                    if (keys === stylekeyMap[j][0]) {
                        keys = stylekeyMap[j][1];
                        if (keys === 'overflowX' || keys === 'overflowY') {
                            if (this.state[stylekeyMap[j][0]] === 'true' || this.state[stylekeyMap[j][0]] === true)
                                this.state[stylekeyMap[j][0]] = 'auto';
                            else if (this.state[stylekeyMap[j][0]] === 'false' || this.state[stylekeyMap[j][0]] === false)
                                this.state[stylekeyMap[j][0]] = 'hidden'
                        }
                        this.setTopStyle(keys, this.state[stylekeyMap[j][0]]);
                        return
                    }
                }
                this.setTopStyle(keys, this.state[keys]);
                if ((keys === 'margin' || keys === 'padding') && typeof this.__updateHighlightConfig === 'function') {
                    this.__updateHighlightConfig()
                }
                return
            }
            this.updatePositionValue();
            this.__updateVisible();
            this.__updateLayoutWidth();
            this.__updateLayoutHeight();
            this.__updateLayoutTop();
            this.__updateLayoutLeft();
            this.__updateLayoutRight();
            this.__updateLayoutBottom();
            this.__updateDisabled();
            this.setTopStyle('maxWidth', this.state.maxWidth);
            this.setTopStyle('minWidth', this.state.minWidth);
            this.setTopStyle('maxHeight', this.state.maxHeight);
            this.setTopStyle('minHeight', this.state.minHeight);
            this.setTopStyle('lineHeight', this.state.lineHeight);
            this.setTopStyle('background', this.state.background);
            this.setTopStyle('backgroundColor', this.state.backgroundColor);
            this.__updateBackgroundImage();
            this.__updateOpacity();
            this.setTopStyle('margin', this.state.margin);
            this.__updatePadding();
            this.setTopStyle('color', this.state.textColor);
            this.setTopStyle('fontSize', this.state.textSize);
            this.__updateBorder();
            this.__updateBorderStyle();
            this.__updateBorderWidth();
            this.__updateBorderTopWidth();
            this.__updateBorderBottomWidth();
            this.__updateBorderLeftWidth();
            this.__updateBorderRightWidth();
            this.__updateBorderColor();
            this.__updateBorderTopColor();
            this.__updateBorderBottomColor();
            this.__updateBorderLeftColor();
            this.__updateBorderRightColor();
            this.setTopStyle('borderRadius', this.state.borderRadius);
            this.setTopStyle('zIndex', this.state.zIndex);
            this.setTopStyle('position', this.state.position);
            this.setTopStyle('float', this.state.float);
            this.setTopStyle('cursor', this.state.cursor);
            this.setTopStyle('textAlign', this.state.horizontalAlignment);
            this.setTopStyle('verticalAlign', this.state.layoutVerticalAlignment);
            this.__updateHorizontalScroll();
            this.__updateVerticalScroll()
        }
    }, {
        key: 'updatePositionValue',
        value: function updatePositionValue() {
            this.splitMargin()
        }
    }, {
        key: '__updateVisible',
        value: function __updateVisible() {
            if (typeof this.__updateVisibleInternal === 'function')
                this.__updateVisibleInternal();
            if (this.state.visible === true || this.state.visible === 'true')
                this.state.visible = 'visible';
            if (this.state.visible === false || this.state.visible === 'false')
                this.state.visible = 'hidden';
            this.__updateDisplay();
            this.setTopStyle('visibility', this.state.visible)
        }
    }, {
        key: '__updateDisplay',
        value: function __updateDisplay() {
            if (this.state.display === 'none' || this.state.visible == 'none') {
                this.setTopStyle('display', 'none')
            } else {
                this.removeTopStyle('display')
            }
        }
    }, {
        key: 'splitMargin',
        value: function splitMargin() {
            if (this.state.margin) {
                var temp = this.state.margin.split(' ');
                if (temp.length == 1) {
                    this.state.marginTop = this.state.marginRight = this.state.marginBottom = this.state.marginLeft = temp[0]
                } else if (temp.length == 2) {
                    this.state.marginTop = this.state.marginBottom = temp[0];
                    this.state.marginRight = this.state.marginLeft = temp[1]
                } else if (temp.length == 4) {
                    this.state.marginTop = temp[0];
                    this.state.marginRight = temp[1];
                    this.state.marginBottom = temp[2];
                    this.state.marginLeft = temp[3]
                }
            } else {
                if (!this.state.marginTop)
                    this.state.marginTop = 0;
                if (!this.state.marginRight)
                    this.state.marginRight = 0;
                if (!this.state.marginBottom)
                    this.state.marginBottom = 0;
                if (!this.state.marginLeft)
                    this.state.marginLeft = 0
            }
        }
    }, {
        key: '__updatePadding',
        value: function __updatePadding() {
            this.setStyleValue(this.getPaddingStyleObjectKey(), 'padding', this.state.padding.paddingString)
        }
    }, {
        key: 'getPaddingStyleObjectKey',
        value: function getPaddingStyleObjectKey() {
            return 'topStyle'
        }
    }, {
        key: '__updateBorder',
        value: function __updateBorder() {
            if (this.state.border) {
                this.setTopStyle('border', this.state.border.borderString)
            } else {
                this.removeTopStyle('border')
            }
        }
    }, {
        key: '__updateBorderStyle',
        value: function __updateBorderStyle() {
            if (this.state.borderStyle) {
                this.setTopStyle('borderStyle', this.state.borderStyle)
            } else {
                this.removeTopStyle('borderStyle')
            }
        }
    }, {
        key: '__updateBorderWidth',
        value: function __updateBorderWidth() {
            if (this.state.borderWidth.borderWidthString) {
                this.setTopStyle('borderWidth', this.state.borderWidth.borderWidthString)
            } else {
                this.removeTopStyle('borderWidth')
            }
        }
    }, {
        key: '__updateBorderTopWidth',
        value: function __updateBorderTopWidth() {
            if (this.state.borderTopWidth) {
                this.setTopStyle('borderTopWidth', this.state.borderTopWidth)
            } else {
                this.removeTopStyle('borderTopWidth')
            }
        }
    }, {
        key: '__updateBorderBottomWidth',
        value: function __updateBorderBottomWidth() {
            if (this.state.borderBottomWidth) {
                this.setTopStyle('borderBottomWidth', this.state.borderBottomWidth)
            } else {
                this.removeTopStyle('borderBottomWidth')
            }
        }
    }, {
        key: '__updateBorderLeftWidth',
        value: function __updateBorderLeftWidth() {
            if (this.state.borderLeftWidth) {
                this.setTopStyle('borderLeftWidth', this.state.borderLeftWidth)
            } else {
                this.removeTopStyle('borderLeftWidth')
            }
        }
    }, {
        key: '__updateBorderRightWidth',
        value: function __updateBorderRightWidth() {
            if (this.state.borderRightWidth) {
                this.setTopStyle('borderRightWidth', this.state.borderRightWidth)
            } else {
                this.removeTopStyle('borderRightWidth')
            }
        }
    }, {
        key: '__updateBorderColor',
        value: function __updateBorderColor() {
            if (this.state.borderColor) {
                this.setTopStyle('borderColor', this.state.borderColor)
            } else {
                this.removeTopStyle('borderColor')
            }
        }
    }, {
        key: '__updateBorderTopColor',
        value: function __updateBorderTopColor() {
            if (this.state.borderTopColor) {
                this.setTopStyle('borderTopColor', this.state.borderTopColor)
            } else {
                this.removeTopStyle('borderTopColor')
            }
        }
    }, {
        key: '__updateBorderBottomColor',
        value: function __updateBorderBottomColor() {
            if (this.state.borderBottomColor) {
                this.setTopStyle('borderBottomColor', this.state.borderBottomColor)
            } else {
                this.removeTopStyle('borderBottomColor')
            }
        }
    }, {
        key: '__updateBorderLeftColor',
        value: function __updateBorderLeftColor() {
            if (this.state.borderLeftColor) {
                this.setTopStyle('borderLeftColor', this.state.borderLeftColor)
            } else {
                this.removeTopStyle('borderLeftColor')
            }
        }
    }, {
        key: '__updateBorderRightColor',
        value: function __updateBorderRightColor() {
            if (this.state.borderRightColor) {
                this.setTopStyle('borderRightColor', this.state.borderRightColor)
            } else {
                this.removeTopStyle('borderRightColor')
            }
        }
    }, {
        key: '__updateLayoutWidth',
        value: function __updateLayoutWidth(layoutWidth) {
            if (!layoutWidth && !this.state.layoutWidth)
                return;
            if (!layoutWidth)
                layoutWidth = this.state.layoutWidth;
            if (layoutWidth && layoutWidth.endsWith('%')) {
                var boxing = parseInt(this.state.marginRight) + parseInt(this.state.marginLeft);
                if (boxing > 0) {
                    layoutWidth = 'calc(' + layoutWidth + ' - ' + boxing + 'px)'
                }
            }
            if (this.__isAttached && this.getLayoutParent() && typeof this.getLayoutParent().setShouldComplete === 'function')
                this.getLayoutParent().setShouldComplete(this, 'layoutWidth');
            if (layoutWidth === 'match_parent')
                return;
            this.setTopStyle('width', layoutWidth)
        }
    }, {
        key: '__updateLayoutHeight',
        value: function __updateLayoutHeight(layoutHeight) {
            if (!layoutHeight && !this.state.layoutHeight)
                return;
            if (!layoutHeight)
                layoutHeight = this.state.layoutHeight;
            if (layoutHeight.endsWith('%')) {
                var boxing = parseInt(this.state.marginTop) + parseInt(this.state.marginBottom);
                if (boxing > 0) {
                    layoutHeight = 'calc(' + layoutHeight + ' - ' + boxing + 'px)'
                }
            }
            if (this.__isAttached && this.getLayoutParent() && typeof this.getLayoutParent().setShouldComplete === 'function')
                this.getLayoutParent().setShouldComplete(this, 'layoutHeight');
            if (layoutHeight === 'match_parent')
                return;
            this.setTopStyle('height', layoutHeight)
        }
    }, {
        key: '__updateLayoutTop',
        value: function __updateLayoutTop() {
            if (!this.props.layoutParent || this.props.layoutParent && this.props.layoutParent.props.tagName != 'top-absolutelayout') {
                this.setTopStyle('top', this.state.layoutTop)
            } else if (this.props.layoutParent && this.props.layoutParent.props.tagName === 'top-absolutelayout') {
                var pPaddingTop = parseFloat(this.props.layoutParent.state.padding.paddingTop) || 0;
                if (this.state.layoutTop && this.state.layoutTop.includes('%')) {
                    var layoutTop = 'calc(' + this.state.layoutTop + ' + ' + pPaddingTop + 'px)'
                } else {
                    var layoutTop = (parseInt(this.state.layoutTop) || 0) + pPaddingTop + 'px'
                }
                this.setTopTagStyle('top', layoutTop)
            }
        }
    }, {
        key: '__updateLayoutLeft',
        value: function __updateLayoutLeft() {
            if (!this.props.layoutParent || this.props.layoutParent && this.props.layoutParent.props.tagName != 'top-absolutelayout') {
                this.setTopStyle('left', this.state.layoutLeft)
            } else if (this.props.layoutParent && this.props.layoutParent.props.tagName === 'top-absolutelayout') {
                var pPaddingLeft = parseFloat(this.props.layoutParent.state.padding.paddingLeft) || 0;
                if (this.state.layoutLeft && this.state.layoutLeft.includes('%')) {
                    var layoutLeft = 'calc(' + this.state.layoutLeft + ' + ' + pPaddingLeft + 'px)'
                } else {
                    var layoutLeft = (parseInt(this.state.layoutLeft) || 0) + pPaddingLeft + 'px'
                }
                this.setTopTagStyle('left', layoutLeft)
            }
        }
    }, {
        key: '__updateLayoutRight',
        value: function __updateLayoutRight() {
            if (!this.props.layoutParent || this.props.layoutParent && this.props.layoutParent.props.tagName != 'top-absolutelayout') {
                this.setTopStyle('right', this.state.layoutRight)
            } else if (this.props.layoutParent && this.props.layoutParent.props.tagName === 'top-absolutelayout') {
                var pPaddingRight = parseFloat(this.props.layoutParent.state.padding.paddingRight) || 0;
                if (this.state.layoutRight && this.state.layoutRight.includes('%')) {
                    var layoutRight = 'calc(' + this.state.layoutRight + ' + ' + pPaddingRight + 'px)'
                } else {
                    var layoutRight = (parseInt(this.state.layoutRight) || 0) + pPaddingRight + 'px'
                }
                if (!this.state.layoutLeft && this.state.layoutRight)
                    this.removeTopTagStyle('left');
                this.setTopTagStyle('right', layoutRight)
            }
        }
    }, {
        key: '__updateLayoutBottom',
        value: function __updateLayoutBottom() {
            if (!this.props.layoutParent || this.props.layoutParent && this.props.layoutParent.props.tagName != 'top-absolutelayout') {
                this.setTopStyle('bottom', this.state.layoutBottom)
            } else if (this.props.layoutParent && this.props.layoutParent.props.tagName === 'top-absolutelayout') {
                var pPaddingBottom = parseFloat(this.props.layoutParent.state.padding.paddingBottom) || 0;
                if (this.state.layoutBottom && this.state.layoutBottom.includes('%')) {
                    var layoutBottom = 'calc(' + this.state.layoutBottom + ' + ' + pPaddingBottom + 'px)'
                } else {
                    var layoutBottom = (parseInt(this.state.layoutBottom) || 0) + pPaddingBottom + 'px'
                }
                if (!this.state.layoutTop && this.state.layoutBottom)
                    this.removeTopTagStyle('top');
                this.setTopTagStyle('bottom', layoutBottom)
            }
        }
    }, {
        key: '__updateBackgroundImage',
        value: function __updateBackgroundImage() {
            var bImage = this.state.backgroundImage;
            if (this.state.backgroundImage != null) {
                if (!this.state.backgroundImage.includes('url(')) {
                    if (this.state.backgroundImage.includes('@drawable')) {
                        bImage = TopUI.DrawableManager.get(this.state.backgroundImage.replace('@drawable/', ''))
                    }
                    bImage = 'url(' + bImage + ')'
                }
                this.setTopStyle('backgroundImage', bImage);
                if (this.state.tileMode == null || this.state.tileMode === '')
                    this.state.tileMode = 'stretch';
                if (this.state.tileMode === 'stretch')
                    this.setTopStyle('backgroundSize', 'cover');
                else {
                    this.setTopStyle('backgroundRepeat', this.state.tileMode)
                }
            }
        }
    }, {
        key: '__updateDisabled',
        value: function __updateDisabled() {
            if (this.props.layoutParent) {
                this.__derivedDisabled = this.props.layoutParent.state.disabled === true ? true : this.props.layoutParent.__derivedDisabled
            } else {
                this.__derivedDisabled = this.state.disabled
            }
            if (this.__calculateDerivedDisabled() === true) {
                this.addClassToTopClassList('disabled')
            } else {
                this.removeClassFromTopClassList('disabled')
            }
        }
    }, {
        key: '__updateOpacity',
        value: function __updateOpacity() {
            var opacity = this.state.opacity;
            if (opacity) {
                if (typeof opacity === 'string') {
                    if (opacity.endsWith('%')) {
                        opacity = Number(opacity.slice(0, opacity.indexOf('%'))) / 100
                    } else {
                        opacity = Number(opacity)
                    }
                }
                this.setTopStyle('opacity', opacity)
            } else {
                this.removeTopStyle('opacity')
            }
        }
    }, {
        key: '__calculateDerivedDisabled',
        value: function __calculateDerivedDisabled() {
            return this.__derivedDisabled === true ? true : this.state.disabled === true ? true : false
        }
    }, {
        key: '__updateHorizontalScroll',
        value: function __updateHorizontalScroll() {
            var horizontalScroll = this.state.horizontalScroll;
            if (this.state.horizontalScroll === 'true' && this.props.tagName !== 'top-tableview')
                horizontalScroll = 'auto';
            if (this.state.horizontalScroll === 'false')
                horizontalScroll = 'hidden';
            this.setTopStyle('overflowX', horizontalScroll)
        }
    }, {
        key: '__updateVerticalScroll',
        value: function __updateVerticalScroll() {
            var verticalScroll = this.state.verticalScroll;
            if (this.state.verticalScroll === 'true')
                verticalScroll = 'auto';
            if (this.state.verticalScroll === 'false')
                verticalScroll = 'hidden';
            this.setTopStyle('overflowY', verticalScroll)
        }
    }, {
        key: 'setTopStyle',
        value: function setTopStyle(key, value) {
            if (this.__isAttached) {
                var changedStyle = {};
                Object.assign(changedStyle, this.topStyle);
                if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                    var keys = Object.keys(properties);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        changedStyle[keys[i]] = key[keys[i]]
                    }
                } else {
                    changedStyle[key] = value
                }
                this.topStyle = changedStyle
            } else {
                this.topStyle[key] = value
            }
        }
    }, {
        key: 'setStyleValue',
        value: function setStyleValue(styleObjectKey, key, value) {
            if (this.__isAttached) {
                var changedStyle = {};
                Object.assign(changedStyle, this[styleObjectKey]);
                if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                    var keys = Object.keys(properties);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        changedStyle[keys[i]] = key[keys[i]]
                    }
                } else {
                    changedStyle[key] = value
                }
                this[styleObjectKey] = changedStyle
            } else {
                this[styleObjectKey][key] = value
            }
        }
    }, {
        key: 'removeTopStyle',
        value: function removeTopStyle(key) {
            if (this.__isAttached) {
                var changedStyle = {};
                Object.assign(changedStyle, this.topStyle);
                delete changedStyle[key];
                this.topStyle = changedStyle
            } else {
                delete this.topStyle[key]
            }
        }
    }, {
        key: 'setTopTagStyle',
        value: function setTopTagStyle(key, value) {
            if (this.__isAttached) {
                var changedTopTagStyle = {};
                Object.assign(changedTopTagStyle, this.topTagStyle);
                if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                    var keys = Object.keys(properties);
                    for (var i = 0, len = keys.length; i < len; i++) {
                        changedTopTagStyle[keys[i]] = key[keys[i]]
                    }
                } else {
                    changedTopTagStyle[key] = value
                }
                this.topTagStyle = changedTopTagStyle
            } else {
                this.topTagStyle[key] = value
            }
        }
    }, {
        key: 'removeTopTagStyle',
        value: function removeTopTagStyle(key) {
            if (this.__isAttached) {
                var changedTopTagStyle = {};
                Object.assign(changedTopTagStyle, this.topTagStyle);
                delete changedTopTagStyle[key];
                this.topTagStyle = changedTopTagStyle
            } else {
                delete this.topTagStyle[key]
            }
        }
    }, {
        key: 'getValidBorderTopWidth',
        value: function getValidBorderTopWidth() {
            if (this.state.borderTopWidth)
                return this.state.borderTopWidth;
            else if (this.state.borderWidth)
                return this.state.borderWidth.borderTopWidth;
            else if (this.state.border)
                return this.state.border.borderTopWidth;
            return undefined
        }
    }, {
        key: 'getValidBorderBottomWidth',
        value: function getValidBorderBottomWidth() {
            if (this.state.borderBottomWidth)
                return this.state.borderBottomWidth;
            else if (this.state.borderWidth)
                return this.state.borderWidth.borderBottomWidth;
            else if (this.state.border)
                return this.state.border.borderBottomWidth;
            return undefined
        }
    }, {
        key: 'getValidBorderLeftWidth',
        value: function getValidBorderLeftWidth() {
            if (this.state.borderLeftWidth)
                return this.state.borderLeftWidth;
            else if (this.state.borderWidth)
                return this.state.borderWidth.borderLeftWidth;
            else if (this.state.border)
                return this.state.border.borderLeftWidth;
            return undefined
        }
    }, {
        key: 'getValidBorderRightWidth',
        value: function getValidBorderRightWidth() {
            if (this.state.borderRightWidth)
                return this.state.borderRightWidth;
            else if (this.state.borderWidth)
                return this.state.borderWidth.borderRightWidth;
            else if (this.state.border)
                return this.state.border.borderRightWidth;
            return undefined
        }
    }]);
    return TopCommonstyleBehavior
}(TopDataBehavior);
TopCommonstyleBehavior.propConfigs = Object.assign({}, TopDataBehavior.propConfigs, {
    padding: {
        type: String,
        default: '',
        convert: function convert(value) {
            var temp = value.split(' ');
            var paddingTop = paddingRight = paddingBottom = paddingLeft = '0';
            if (temp.length == 1) {
                paddingTop = paddingRight = paddingBottom = paddingLeft = temp[0]
            } else if (temp.length == 2) {
                paddingTop = paddingBottom = temp[0];
                paddingRight = paddingLeft = temp[1]
            } else if (temp.length == 4) {
                paddingTop = temp[0];
                paddingRight = temp[1];
                paddingBottom = temp[2];
                paddingLeft = temp[3]
            }
            return {
                paddingString: value,
                paddingTop: paddingTop,
                paddingRight: paddingRight,
                paddingBottom: paddingBottom,
                paddingLeft: paddingLeft
            }
        }
    },
    border: {
        type: String,
        default: '',
        convert: function convert(value) {
            var tmpBorder = value.split(' ');
            var borderStyle, borderWidth, borderColor;
            if (tmpBorder.length == 1) {
                if (TopUI.BorderManager.isGlobalValue(tmpBorder[0])) {
                    return {
                        borderString: value,
                        borderStyle: borderStyle,
                        borderTopStyle: borderStyle,
                        borderBottomStyle: borderStyle,
                        borderLeftStyle: borderStyle,
                        borderRightStyle: borderStyle,
                        borderWidth: borderWidth,
                        borderTopWidth: borderWidth,
                        borderBottomWidth: borderWidth,
                        borderLeftWidth: borderWidth,
                        borderRightWidth: borderWidth,
                        borderColor: borderColor,
                        borderTopColor: borderColor,
                        borderBottomColor: borderColor,
                        borderLeftColor: borderColor,
                        borderRightColor: borderColor
                    }
                } else if (TopUI.BorderManager.isBorderStyle(tmpBorder[0])) {
                    borderStyle = tmpBorder[0]
                } else if (TopUI.BorderManager.isBorderWidth(tmpBorder[0])) {
                    borderWidth = tmpBorder[0]
                } else {
                    borderColor = tmpBorder[0]
                }
            } else if (tmpBorder.length == 2) {
                var split = TopUI.BorderManager.splitBorder(tmpBorder);
                borderStyle = split.borderStyle;
                borderWidth = split.borderWidth;
                borerColor = split.borderColor
            } else if (tmpBorder.length == 3) {
                var split = TopUI.BorderManager.splitBorder(tmpBorder);
                borderStyle = split.borderStyle;
                borderWidth = split.borderWidth;
                borerColor = split.borderColor
            }
            return {
                borderString: value,
                borderStyle: borderStyle,
                borderTopStyle: borderStyle,
                borderBottomStyle: borderStyle,
                borderLeftStyle: borderStyle,
                borderRightStyle: borderStyle,
                borderWidth: borderWidth,
                borderTopWidth: borderWidth,
                borderBottomWidth: borderWidth,
                borderLeftWidth: borderWidth,
                borderRightWidth: borderWidth,
                borderColor: borderColor,
                borderTopColor: borderColor,
                borderBottomColor: borderColor,
                borderLeftColor: borderColor,
                borderRightColor: borderColor
            }
        }
    },
    borderWidth: {
        type: String,
        default: '',
        convert: function convert(value) {
            var borderWidth = TopUI.BorderManager.splitBorderWidth(value);
            return {
                borderWidthString: value,
                borderTopWidth: borderWidth.borderTopWidth,
                borderBottomWidth: borderWidth.borderBottomWidth,
                borderLeftWidth: borderWidth.borderLeftWidth,
                borderRightWidth: borderWidth.borderRightWidth
            }
        }
    },
    borderTopWidth: {
        type: String
    },
    borderBottomWidth: {
        type: String
    },
    borderLeftWidth: {
        type: String
    },
    borderRightWidth: {
        type: String
    },
    borderStyle: {
        type: String
    },
    borderTopStyle: {
        type: String,
        options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'unset']
    },
    borderBottomStyle: {
        type: String,
        options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'unset']
    },
    borderLeftStyle: {
        type: String,
        options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'unset']
    },
    borderRightStyle: {
        type: String,
        options: ['', 'none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'inherit', 'initial', 'unset']
    },
    borderColor: {
        type: String
    },
    borderTopColor: {
        type: String
    },
    borderBottomColor: {
        type: String
    },
    borderLeftColor: {
        type: String
    },
    borderRightColor: {
        type: String
    }
});
(function() {
    var PropertyManagerCreator = function PropertyManagerCreator(TopUI) {
        PropertyManager.prototype = Object.create(TopUI.prototype);
        PropertyManager.prototype.constructor = PropertyManager;
        function PropertyManager() {}
        return PropertyManager
    };
    var BorderManagerCreator = function BorderManagerCreator(TopUI) {
        BorderManager.prototype = Object.create(TopUI.PropertyManager.prototype);
        BorderManager.prototype.constructor = BorderManager;
        BorderManager.borderStyleOptions = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
        BorderManager.borderGlobalOptions = ['inherit', 'initial', 'unset'];
        BorderManager.borderWidthOptions = ['thin', 'medium', 'thick'];
        function BorderManager() {}
        BorderManager.splitBorder = function(borer) {
            var styleAlreadyChecked = false
              , widthAlreadyChecked = false
              , colorAlreadyChecked = false;
            var borderStyle, borderWidth, borderColor;
            for (var i = 0; i < borer.length; i++) {
                if (!styleAlreadyChecked && this.isBorderStyle(borer[i])) {
                    borderStyle = borer[i];
                    styleAlreadyChecked = true
                } else if (!widthAlreadyChecked && this.isBorderWidth(borer[i])) {
                    borderWidth = borer[i];
                    widthAlreadyChecked = true
                } else if (!colorAlreadyChecked) {
                    borderColor = borer[i]
                }
            }
            return {
                borderStyle: borderStyle,
                borderWidth: borderWidth,
                borderColor: borderColor
            }
        }
        ;
        BorderManager.splitBorderWidth = function(borderWidth) {
            var tmpBorderWidth = borderWidth.split(' ');
            var borderTopWidth, borderBottomWidth, borderLeftWidth, borderRightWidth;
            if (tmpBorderWidth.length == 1) {
                if (this.isGlobalValue(tmpBorderWidth[0])) {
                    return {
                        borderTopWidth: borderTopWidth,
                        borderBottomWidth: borderBottomWidth,
                        borderLeftWidth: borderLeftWidth,
                        borderRightWidth: borderRightWidth
                    }
                } else if (this.isBorderWidth(tmpBorderWidth[0])) {
                    borderTopWidth = tmpBorderWidth[0];
                    borderBottomWidth = tmpBorderWidth[0];
                    borderLeftWidth = tmpBorderWidth[0];
                    borderRightWidth = tmpBorderWidth[0]
                }
            } else if (tmpBorderWidth.length === 2) {
                if (this.isBorderWidth(tmpBorderWidth[0])) {
                    borderTopWidth = tmpBorderWidth[0];
                    borderBottomWidth = tmpBorderWidth[0]
                }
                if (this.isBorderWidth(tmpBorderWidth[1])) {
                    borderLeftWidth = tmpBorderWidth[1];
                    borderRightWidth = tmpBorderWidth[1]
                }
            } else if (tmpBorderWidth.length === 3) {
                if (this.isBorderWidth(tmpBorderWidth[0])) {
                    borderTopWidth = tmpBorderWidth[0]
                }
                if (this.isBorderWidth(tmpBorderWidth[1])) {
                    borderLeftWidth = tmpBorderWidth[1];
                    borderRightWidth = tmpBorderWidth[1]
                }
                if (this.isBorderWidth(tmpBorderWidth[2])) {
                    borderBottomWidth = tmpBorderWidth[2]
                }
            } else if (tmpBorderWidth.length === 4) {
                if (this.isBorderWidth(tmpBorderWidth[0])) {
                    borderTopWidth = tmpBorderWidth[0]
                }
                if (this.isBorderWidth(tmpBorderWidth[1])) {
                    borderRightWidth = tmpBorderWidth[1]
                }
                if (this.isBorderWidth(tmpBorderWidth[2])) {
                    borderBottomWidth = tmpBorderWidth[2]
                }
                if (this.isBorderWidth(tmpBorderWidth[3])) {
                    borderLeftWidth = tmpBorderWidth[3]
                }
            }
            return {
                borderTopWidth: borderTopWidth,
                borderBottomWidth: borderBottomWidth,
                borderLeftWidth: borderLeftWidth,
                borderRightWidth: borderRightWidth
            }
        }
        ;
        BorderManager.isGlobalValue = function(style) {
            return this.borderGlobalOptions.includes(style)
        }
        ;
        BorderManager.isBorderStyle = function(style) {
            return this.borderStyleOptions.includes(style)
        }
        ;
        BorderManager.isBorderWidth = function(style) {
            if (this.borderWidthOptions.includes(style) || parseFloat(style) >= 0 || parseFloat(style) <= 0)
                return true;
            return false
        }
        ;
        return BorderManager
    };
    TopUI.PropertyManager = PropertyManagerCreator(TopUI);
    TopUI.BorderManager = BorderManagerCreator(TopUI)
}
)();
TopCommonstyleBehavior.defaultProps = Object.assign({}, TopDataBehavior.defaultProps, {});
var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopTextstyleBehavior = function(_TopCommonstyleBehavi) {
    _inherits(TopTextstyleBehavior, _TopCommonstyleBehavi);
    function TopTextstyleBehavior(props) {
        _classCallCheck(this, TopTextstyleBehavior);
        var _this = _possibleConstructorReturn(this, (TopTextstyleBehavior.__proto__ || Object.getPrototypeOf(TopTextstyleBehavior)).call(this, props));
        _this.__updateTextStyle();
        return _this
    }
    _createClass(TopTextstyleBehavior, [{
        key: '__updateTextStyle',
        value: function __updateTextStyle() {
            if (this.state.textStyle === undefined)
                return;
            if (this.state.textStyle === 'none' || this.state.textStyle === '') {
                this.removeTopStyle('fontWeight');
                this.removeTopStyle('fontStyle');
                this.removeTopStyle('textDecoration');
                return
            }
            var textStyleArray = this.state.textStyle.split('|');
            for (var i = 0; i < textStyleArray.length; i++) {
                textStyleArray[i] = textStyleArray[i].replace(/ /g, '');
                if (textStyleArray[i] === 'bold') {
                    this.removeTopStyle('fontWeight');
                    this.setTopStyle('fontWeight', 'bold')
                }
                if (textStyleArray[i] === 'italic') {
                    this.removeTopStyle('fontStyle');
                    this.setTopStyle('fontStyle', 'italic')
                }
                if (textStyleArray[i] === 'underline') {
                    this.removeTopStyle('textDecoration');
                    this.setTopStyle('textDecoration', 'underline')
                }
            }
        }
    }, {
        key: 'setTopTextStyle',
        value: function setTopTextStyle(key, value) {
            var changedStyle = {};
            Object.assign(changedStyle, this.topTextStyle);
            if ((typeof key === 'undefined' ? 'undefined' : _typeof(key)) === 'object') {
                var keys = Object.keys(properties);
                for (var i = 0, len = keys.length; i < len; i++) {
                    changedStyle[keys[i]] = key[keys[i]]
                }
            } else {
                changedStyle[key] = value
            }
            this.topTextStyle = changedStyle
        }
    }, {
        key: 'removeTopTextStyle',
        value: function removeTopTextStyle(key) {
            this.setTopTextStyle(key, undefined)
        }
    }]);
    return TopTextstyleBehavior
}(TopCommonstyleBehavior);
TopTextstyleBehavior.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {});
TopTextstyleBehavior.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {});
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopContainerBehavior = function(_TopCommonstyleBehavi) {
    _inherits(TopContainerBehavior, _TopCommonstyleBehavi);
    function TopContainerBehavior(props) {
        _classCallCheck(this, TopContainerBehavior);
        var _this = _possibleConstructorReturn(this, (TopContainerBehavior.__proto__ || Object.getPrototypeOf(TopContainerBehavior)).call(this, props));
        _this.initialLayout();
        return _this
    }
    _createClass(TopContainerBehavior, [{
        key: 'initialLayout',
        value: function initialLayout() {
            this.itemLayoutDom = this.state.children
        }
    }, {
        key: 'initializeHtmlObjects',
        value: function initializeHtmlObjects(child) {
            var attrs = Array.prototype.slice.call(child.attributes);
            var props = {
                key: child.tagName.toUpperCase() + '-' + top_index
            };
            top_index++;
            attrs.map(function(attr) {
                return props[TopUI.Util.toCamelCase(attr.name)] = attr.value
            });
            if (!props.id) {
                props.id = TopUI.Util.guid()
            }
            if (!!props.class) {
                props.className = props.class;
                delete props.class
            }
            var children = [];
            for (var i = 0; i < child.children.length; i++) {
                children.push(this.initializeHtmlObjects(child.children[i]))
            }
            props.children = children;
            var comp = TopUI.Render.topWidgets[child.tagName.toLowerCase()];
            return React.createElement(comp, props, children)
        }
    }]);
    return TopContainerBehavior
}(TopCommonstyleBehavior);
TopContainerBehavior.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {});
TopContainerBehavior.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {});
TopUI.Widget.Container = function() {
    Container.prototype = Object.create(TopUI.Widget.prototype);
    Container.prototype.constructor = Container;
    function Container() {}
    Container.prototype.getItems = function() {
        var items;
        if (!this.template)
            return undefined;
        if (typeof this.template.state.items === 'string')
            items = TopUI.Util.namespace(this.template.state.items, this.template);
        else
            items = this.template.state.items;
        return items
    }
    ;
    return Container
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopTextBehavior = function(_TopTextstyleBehavior) {
    _inherits(TopTextBehavior, _TopTextstyleBehavior);
    function TopTextBehavior(props) {
        _classCallCheck(this, TopTextBehavior);
        var _this = _possibleConstructorReturn(this, (TopTextBehavior.__proto__ || Object.getPrototypeOf(TopTextBehavior)).call(this, props));
        _this.__updateReadonly();
        return _this
    }
    _createClass(TopTextBehavior, [{
        key: '__updateReadonly',
        value: function __updateReadonly() {
            if (this.state.readonly === true) {
                this.addClassToTopClassList('readonly')
            } else {
                this.removeClassFromTopClassList('readonly')
            }
        }
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            this.setState({
                text: e.target.value
            })
        }
    }]);
    return TopTextBehavior
}(TopTextstyleBehavior);
TopTextBehavior.propConfigs = Object.assign({}, TopTextstyleBehavior.propConfigs, {});
TopTextBehavior.defaultProps = Object.assign({}, TopTextstyleBehavior.defaultProps, {});
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopCheckBehavior = function(_TopTextstyleBehavior) {
    _inherits(TopCheckBehavior, _TopTextstyleBehavior);
    function TopCheckBehavior(props) {
        _classCallCheck(this, TopCheckBehavior);
        return _possibleConstructorReturn(this, (TopCheckBehavior.__proto__ || Object.getPrototypeOf(TopCheckBehavior)).call(this, props))
    }
    _createClass(TopCheckBehavior, [{
        key: 'handleChange',
        value: function handleChange(e) {
            this.setState({
                checked: e.target.checked
            })
        }
    }]);
    return TopCheckBehavior
}(TopTextstyleBehavior);
TopCheckBehavior.propConfigs = Object.assign({}, TopTextstyleBehavior.propConfigs, {
    checked: {
        type: Boolean,
        options: [true, false],
        default: false
    },
    checkPosition: {
        type: String,
        options: ['left', 'right'],
        default: 'left'
    }
});
TopCheckBehavior.defaultProps = Object.assign({}, TopTextstyleBehavior.defaultProps, {});
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopRangeBehavior = function(_TopCommonstyleBehavi) {
    _inherits(TopRangeBehavior, _TopCommonstyleBehavi);
    function TopRangeBehavior(props) {
        _classCallCheck(this, TopRangeBehavior);
        return _possibleConstructorReturn(this, (TopRangeBehavior.__proto__ || Object.getPrototypeOf(TopRangeBehavior)).call(this, props))
    }
    return TopRangeBehavior
}(TopCommonstyleBehavior);
TopRangeBehavior.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {
    step: {
        type: Number,
        default: 1
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 100
    },
    number: {
        type: [Number, Array],
        default: 50
    }
});
TopRangeBehavior.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {});
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopLayoutBehavior = function(_TopCommonstyleBehavi) {
    _inherits(TopLayoutBehavior, _TopCommonstyleBehavi);
    function TopLayoutBehavior(props) {
        _classCallCheck(this, TopLayoutBehavior);
        var _this2 = _possibleConstructorReturn(this, (TopLayoutBehavior.__proto__ || Object.getPrototypeOf(TopLayoutBehavior)).call(this, props));
        _this2.layoutChild = [];
        _this2.shouldComplete = false;
        return _this2
    }
    _createClass(TopLayoutBehavior, [{
        key: '__layoutAttached',
        value: function __layoutAttached() {
            this.__initSrc()
        }
    }, {
        key: '__initSrc',
        value: function __initSrc() {
            if (typeof this.state.src === 'string') {
                var _this = this;
                this.state.src = TopUI.Util.__getRawValue(this.state.src);
                TopUI.Ajax.execute(this.state.src, {
                    success: function success(data) {
                        _this.__onSuccessSrcLoad(data)
                    },
                    complete: function complete() {
                        if (_this.__redrawChild !== undefined) {
                            for (var i = 0; i < _this.__redrawChild.length; i++) {
                                _this.__redrawChild[i]()
                            }
                        }
                    }
                })
            }
        }
    }, {
        key: '__onSuccessSrcLoad',
        value: function __onSuccessSrcLoad(data) {
            this.appendHtmlString(data)
        }
    }, {
        key: '__loadScript',
        value: function __loadScript(url, callback) {
            var script = document.createElement('script');
            script.src = url;
            script.onload = callback;
            document.getElementsByTagName('head')[0].appendChild(script)
        }
    }, {
        key: 'appendHtmlString',
        value: function appendHtmlString(htmlString) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = htmlString;
            var newChild = [];
            for (var i = 0; i < wrapper.children.length; i++) {
                newChild.push(this.initializeHtmlObjects(wrapper.children[i]))
            }
            this.setState(function(state, props) {
                return {
                    children: newChild
                }
            }, function() {
                this.complete()
            })
        }
    }, {
        key: 'initializeHtmlObjects',
        value: function initializeHtmlObjects(child) {
            var attrs = Array.prototype.slice.call(child.attributes);
            var props = {
                key: child.tagName.toUpperCase() + '-' + top_index
            };
            top_index++;
            attrs.map(function(attr) {
                return props[TopUI.Util.toCamelCase(attr.name)] = attr.value
            });
            if (!props.id) {
                props.id = TopUI.Util.guid()
            }
            if (!!props.class) {
                props.className = props.class;
                delete props.class
            }
            var children = [];
            for (var i = 0; i < child.children.length; i++) {
                children.push(this.initializeHtmlObjects(child.children[i]))
            }
            props.children = children;
            var comp = TopUI.Render.topWidgets[child.tagName.toLowerCase()];
            return React.createElement(comp, props, children)
        }
    }, {
        key: '__updateDisabled',
        value: function __updateDisabled() {
            if (this.props.layoutParent) {
                this.__derivedDisabled = this.props.layoutParent.state.disabled === true ? true : this.props.layoutParent.__derivedDisabled
            } else {
                this.__derivedDisabled = this.state.disabled
            }
            if (this.state.children.length > 0) {
                var disabled = this.__calculateDerivedDisabled();
                if (this.layoutChild)
                    this.layoutChild.forEach(function(c) {
                        c.__updateDisabled()
                    })
            }
        }
    }, {
        key: '__updateLayoutWidth',
        value: function __updateLayoutWidth(layoutWidth) {
            if (!layoutWidth)
                layoutWidth = this.state.layoutWidth;
            if (layoutWidth == null) {
                layoutWidth = '100%'
            }
            if (layoutWidth && layoutWidth.endsWith('%')) {
                var boxing = parseInt(this.state.marginRight) + parseInt(this.state.marginLeft);
                if (boxing > 0) {
                    layoutWidth = 'calc(' + layoutWidth + ' - ' + boxing + 'px)'
                }
            }
            if (layoutWidth === 'match_parent')
                return;
            this.setTopStyle('width', layoutWidth)
        }
    }, {
        key: '__updateTextSize',
        value: function __updateTextSize() {
            this.setTopStyle('fontSize', '0')
        }
    }, {
        key: 'addWidget',
        value: function addWidget(widget, i) {
            this.setState(function(state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (widget.reactElement) {
                    if (typeof i === 'number')
                        changedchilds.splice(i, 0, widget.reactElement);
                    else
                        changedchilds.push(widget.reactElement)
                } else {
                    if (typeof i === 'number')
                        changedchilds.splice(i, 0, React.createElement(TopUI.Render.topWidgets[widget.template.props.tagName], widget.template.state, widget.template.state.children));
                    else
                        changedchilds.push(React.createElement(TopUI.Render.topWidgets[widget.template.props.tagName], widget.template.state, widget.template.state.children))
                }
                return {
                    children: changedchilds
                }
            });
            if (!widget.template && this.getElement().querySelector(widget.reactElement.props.tagName + '#' + widget.reactElement.props.id))
                widget.template = TopUI.Dom.__selectImpl(this.getElement().querySelector(widget.reactElement.props.tagName + '#' + widget.reactElement.props.id))
        }
    }, {
        key: 'removeWidget',
        value: function removeWidget(widget) {
            var _this3 = this;
            this.setState(function(state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (widget.reactElement && changedchilds.indexOf(widget.reactElement) > -1)
                    changedchilds.splice(changedchilds.indexOf(widget.reactElement), 1);
                else if (_this3.layoutChild.indexOf(widget.template) > -1)
                    changedchilds.splice(_this3.layoutChild.indexOf(widget.template), 1);
                return {
                    children: changedchilds
                }
            })
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.layoutChild = [];
            this.setState({
                children: []
            })
        }
    }, {
        key: 'complete',
        value: function complete() {}
    }]);
    return TopLayoutBehavior
}(TopCommonstyleBehavior);
TopLayoutBehavior.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {
    layoutVerticalAlignment: {
        type: String,
        options: ['top', 'middle', 'bottom']
    },
    verticalAlignment: {
        type: String,
        default: 'top',
        options: ['top', 'middle', 'bottom']
    },
    textSize: {
        type: String,
        default: '0'
    }
});
TopLayoutBehavior.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    children: []
});
TopUI.Widget.Layout = function() {
    Layout.prototype = Object.create(TopUI.Widget.prototype);
    Layout.prototype.constructor = Layout;
    function Layout(obj) {
        Object.assign(this, obj);
        if (this.template == null) {
            this.template = new TopLayout;
            this.template.id = this.id
        }
    }
    Layout.create = function(obj) {
        return new Layout(obj)
    }
    ;
    Layout.prototype.append = function(htmlString, callback) {
        if (TopUI.Util.getFileExtension(htmlString) === 'html') {
            var _this = this;
            TopUI.Ajax.execute(htmlString, {
                success: function success(data) {
                    _this.template.__onSuccessSrcLoad(data);
                    if (typeof callback === 'function')
                        callback()
                },
                complete: function complete() {
                    if (_this.template.__redrawChild !== undefined) {
                        for (var i = 0; i < _this.template.__redrawChild.length; i++) {
                            _this.template.__redrawChild[i]()
                        }
                    }
                }
            })
        } else {
            this.template.__onSuccessSrcLoad(htmlString);
            if (typeof callback === 'function')
                callback()
        }
    }
    ;
    Layout.prototype.html = function(htmlString) {
        this.template.__onSuccessSrcLoad(htmlString)
    }
    ;
    Layout.prototype.load = function(name, callback) {
        if (typeof TopUI.configs.jsPath === 'string') {
            this.src(name + '.html', TopUI.configs.jsPath + '/' + name + '.js', callback)
        } else {
            this.src(name + '.html', name + '.js', callback)
        }
    }
    ;
    Layout.prototype.src = function(htmlFile, jsFile, callback) {
        if (TopUI.Util.getFileExtension(htmlFile) != 'html')
            return;
        if (typeof jsFile === 'function' && callback === undefined)
            callback = jsFile;
        var _this = this;
        loadHtml = function loadHtml() {
            TopUI.Ajax.execute(htmlFile, {
                success: function success(data) {
                    _this.template.__onSuccessSrcLoad(data);
                    if (typeof callback === 'function')
                        callback()
                },
                complete: function complete() {
                    if (_this.template.__redrawChild !== undefined) {
                        for (var i = 0; i < _this.template.__redrawChild.length; i++) {
                            _this.template.__redrawChild[i]()
                        }
                    }
                }
            })
        }
        ;
        this.template.setState({
            src: htmlFile
        });
        if (typeof jsFile === 'string') {
            this.template.__loadScript(jsFile, loadHtml)
        } else {
            loadHtml()
        }
    }
    ;
    Layout.prototype.addWidget = function(widget, i) {
        this.template.addWidget(widget, i)
    }
    ;
    Layout.prototype.removeWidget = function(widget) {
        this.template.removeWidget(widget)
    }
    ;
    Layout.prototype.clear = function() {
        this.template.clear()
    }
    ;
    Layout.prototype.complete = function() {
        this.template.complete()
    }
    ;
    return Layout
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value"in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopMenuBehavior = function(_TopTextstyleBehavior) {
    _inherits(TopMenuBehavior, _TopTextstyleBehavior);
    function TopMenuBehavior(props) {
        _classCallCheck(this, TopMenuBehavior);
        var _this = _possibleConstructorReturn(this, (TopMenuBehavior.__proto__ || Object.getPrototypeOf(TopMenuBehavior)).call(this, props));
        _this.menuData = {
            menuItems: []
        };
        return _this
    }
    _createClass(TopMenuBehavior, [{
        key: "initMenuItems",
        value: function initMenuItems() {
            this.menuData.menuItems = $(this.childRoot).children("top-menuitem");
            for (var i = 0; i < this.menuData.menuItems.length; i++) {
                this.menuData.menuItems[i].menuWidget = this
            }
            if (this.state.items && this.menuData.menuItems && this.menuData.menuItems.length === 1) {
                this.state.menuLayout = this.menuData.menuItems[0].innerHTML
            }
        }
    }, {
        key: "clearMenuItems",
        value: function clearMenuItems() {
            if (this.tagName === "TOP-MENU")
                var myNode = this.childRoot.firstElementChild;
            else
                var myNode = this.childRoot;
            while (myNode && myNode.firstChild) {
                myNode.removeChild(myNode.firstChild)
            }
        }
    }, {
        key: "complete",
        value: function complete() {}
    }]);
    return TopMenuBehavior
}(TopTextstyleBehavior);
TopMenuBehavior.propConfigs = Object.assign({}, TopTextstyleBehavior.propConfigs, {});
TopMenuBehavior.defaultProps = Object.assign({}, TopTextstyleBehavior.defaultProps, {});
TopUI.Widget.Menu = function() {
    Menu.prototype = Object.create(TopUI.Widget.prototype);
    Menu.prototype.constructor = Menu;
    function Menu() {}
    Menu.create = function(obj) {
        return new Menu(obj)
    }
    ;
    Menu.prototype.addMenu = function(widget) {
        this.template.menuItems.push(widget.template)
    }
    ;
    Menu.prototype.removeMenu = function(widget, destroy) {
        var child_len = this.template.menuItems.length;
        for (var i = 0; i < child_len; i++) {
            if (this.template.menuItems[i].id == widget.id) {
                this.template.menuItems.splice(i, 1);
                break
            }
        }
    }
    ;
    return Menu
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopAbsolutelayoutUI = function(_TopLayoutBehavior) {
    _inherits(TopAbsolutelayoutUI, _TopLayoutBehavior);
    function TopAbsolutelayoutUI(props) {
        _classCallCheck(this, TopAbsolutelayoutUI);
        return _possibleConstructorReturn(this, (TopAbsolutelayoutUI.__proto__ || Object.getPrototypeOf(TopAbsolutelayoutUI)).call(this, props))
    }
    _createClass(TopAbsolutelayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__updatePadding',
        value: function __updatePadding() {
            _get(TopAbsolutelayoutUI.prototype.__proto__ || Object.getPrototypeOf(TopAbsolutelayoutUI.prototype), '__updatePadding', this).call(this);
            if (this.__isAttached === true)
                this.layoutChild.forEach(function(c) {
                    console.log('update child', c);
                    c.__updateLayoutTop();
                    c.__updateLayoutLeft();
                    c.__updateLayoutRight();
                    c.__updateLayoutBottom();
                    c.forceUpdate()
                })
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;
            if (children) {
                children = React.Children.map(children, function(child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            this.topTagStyle.position = 'absolute';
                            this.topTagStyle.display = 'inline-block';
                            this.topTagStyle.verticalAlign = 'top';
                            var pWrapWidth = this.props.layoutParent.state.layoutWidth === 'wrap_content' || this.props.layoutParent.state.layoutWidth === 'auto'
                              , pWrapHeight = this.props.layoutParent.state.layoutHeight === 'wrap_content' || this.props.layoutParent.state.layoutHeight === 'auto';
                            var pPaddingWidth = (parseInt(this.props.layoutParent.state.paddingRight) || 0) + (parseInt(this.props.layoutParent.state.paddingLeft) || 0)
                              , pPaddingHeight = (parseInt(this.props.layoutParent.state.paddingTop) || 0) + (parseInt(this.props.layoutParent.state.paddingBottom) || 0);
                            if (this.state.layoutWidth === 'match_parent') {
                                if (pWrapWidth) {
                                    this.__updateLayoutWidth(parseInt(this.state.marginRight) + parseInt(this.state.marginLeft) + 'px')
                                } else {
                                    this.setTopTagStyle('width', 'calc(100% - ' + pPaddingWidth + 'px)');
                                    this.__updateLayoutWidth('100%')
                                }
                            } else if (this.state.layoutWidth && this.state.layoutWidth.includes('%')) {
                                this.setTopTagStyle('width', 'calc(' + this.state.layoutWidth + ' - ' + pPaddingWidth + 'px)');
                                this.__updateLayoutWidth('100%')
                            }
                            if (this.state.layoutHeight === 'match_parent') {
                                if (pWrapHeight) {
                                    this.__updateLayoutHeight(parseInt(this.state.marginTop) + parseInt(this.state.marginBottom) + 'px')
                                } else {
                                    this.setTopTagStyle('height', 'calc(100% - ' + pPaddingHeight + 'px)');
                                    this.__updateLayoutHeight('100%')
                                }
                            } else if (this.state.layoutHeight && this.state.layoutHeight.includes('%')) {
                                this.setTopTagStyle('height', 'calc(' + this.state.layoutHeight + ' - ' + pPaddingHeight + 'px)');
                                this.__updateLayoutHeight('100%')
                            }
                        }
                    })
                })
            }
            return children
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-absolutelayout', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-absolutelayout-root',
                style: this.topStyle
            }, this.__setWrapperStyle(this.state.children)))
        }
    }]);
    return TopAbsolutelayoutUI
}(TopLayoutBehavior);
TopAbsolutelayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {});
TopAbsolutelayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-absolutelayout'
});
TopUI.Widget.Layout.Absolutelayout = function() {
    Absolutelayout.prototype = Object.create(TopUI.Widget.Layout.prototype);
    Absolutelayout.prototype.constructor = Absolutelayout;
    function Absolutelayout(element, props, childs) {
        if (element instanceof TopAbsolutelayoutUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopAbsolutelayoutUI, props, childs)
        }
    }
    Absolutelayout.create = function(element, props, childs) {
        return new Absolutelayout(element,props,childs)
    }
    ;
    return Absolutelayout
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        })
    } else {
        obj[key] = value
    }
    return obj
}
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopAccordionlayoutUI = function(_TopContainerBehavior) {
    _inherits(TopAccordionlayoutUI, _TopContainerBehavior);
    function TopAccordionlayoutUI(props) {
        _classCallCheck(this, TopAccordionlayoutUI);
        return _possibleConstructorReturn(this, (TopAccordionlayoutUI.__proto__ || Object.getPrototypeOf(TopAccordionlayoutUI)).call(this, props))
    }
    _createClass(TopAccordionlayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initProperties',
        value: function __initProperties() {
            this.tabs = this.state.tabs;
            this.items = this.state.items;
            this.dom.active = null
        }
    }, {
        key: '__initTitleText',
        value: function __initTitleText() {
            var _this3 = this;
            this.titleText = {};
            if (this.tabs)
                this.tabs.map(function(tab) {
                    var key = tab.id;
                    var text = tab.text;
                    _this3.titleText[key] = text
                })
        }
    }, {
        key: '__render',
        value: function __render() {
            this.__initProperties();
            this.__initTitleText();
            return React.createElement('top-accordionlayout', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': 'accordion_01 ' + this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-accordionlayout-root',
                style: this.topStyle
            }, this.__renderlayout(this.itemLayoutDom)))
        }
    }, {
        key: '__renderlayout',
        value: function __renderlayout(children) {
            var _this4 = this;
            if (this.tabs) {
                return children.map(function(columnItem, index) {
                    var children = columnItem.props.children;
                    var titleText = _this4.titleText[columnItem.props.id] ? _this4.titleText[columnItem.props.id] : '';
                    return _this4.__renderContainers(children, columnItem.props.id, titleText, index)
                })
            }
            if (this.items) {
                return this.items.map(function(item, index) {
                    var childrenString = _this4.htmlToReactDom(item.html);
                    var titleText = item.text ? item.text : '';
                    return _this4.__renderContainers(childrenString, item.id, titleText, index)
                })
            }
        }
    }, {
        key: '__renderContainers',
        value: function __renderContainers(children, tabId, titleText, index) {
            var container = classNames({
                'top-accordionlayout-container': true
            });
            var title = classNames({
                'top-accordionlayout-title': true
            });
            var content = classNames({
                'top-accordionlayout-content': true
            });
            var icon = classNames({
                'top-accordionlayout-icon': true
            });
            var contentStyle = {
                display: 'none'
            };
            var tabId = classNames(_defineProperty({}, 'top-accordionlayout_' + tabId, true));
            var divKey = tabId;
            return React.createElement('div', {
                className: container,
                id: tabId,
                key: divKey
            }, React.createElement('a', {
                className: title
            }, React.createElement('i', {
                className: icon
            }), titleText), React.createElement('div', {
                className: content,
                style: contentStyle
            }, this.__renderChilds(children)))
        }
    }, {
        key: '__renderChilds',
        value: function __renderChilds(childs, data) {
            function replaceBindingProp(tagName, properties, data, rowIndex) {
                var dataFieldRegExp = new RegExp('{[\\w.]+}','g');
                var matches = [];
                var newProps = {};
                if (!properties.id)
                    newProps.id = TopUI.Util.guid() + '_' + rowIndex;
                else
                    newProps.id = properties.id + '_' + rowIndex;
                for (var key in properties) {
                    if (key === 'children') {
                        var value = [];
                        var newChilds = [];
                        for (var i = 0; i < properties[key].length; i++) {
                            value.push(replaceBindingProp(properties[key][i].props.tagName, properties[key][i].props, data, i));
                            newChilds.push(replaceBindingProp(properties[key][i].props.tagName, properties[key][i].props, data, i))
                        }
                    } else if (key === 'id') {
                        continue
                    } else {
                        if (typeof properties[key] === 'string')
                            matches = properties[key].match(dataFieldRegExp);
                        if (matches && matches.length === 1) {
                            var fieldName = matches[0].substring(1, matches[0].length - 1);
                            var value = data[fieldName]
                        } else {
                            var value = properties[key]
                        }
                    }
                    newProps[key] = value
                }
                return TopUI.Widget.create(tagName, newProps, newChilds).reactElement
            }
            return childs.map(function(child, index, array) {
                return replaceBindingProp(child.props.tagName, child.props, data, index)
            })
        }
    }, {
        key: 'htmlToReactDom',
        value: function htmlToReactDom(htmlString) {
            var wrapper = document.createElement('div');
            wrapper.innerHTML = htmlString;
            var newChild = [];
            for (var i = 0; i < wrapper.children.length; i++) {
                newChild.push(this.initializeHtmlObjects(wrapper.children[i]))
            }
            return newChild
        }
    }]);
    return TopAccordionlayoutUI
}(TopContainerBehavior);
var TopAccordionlayout = function(_TopAccordionlayoutUI) {
    _inherits(TopAccordionlayout, _TopAccordionlayoutUI);
    function TopAccordionlayout(props) {
        _classCallCheck(this, TopAccordionlayout);
        return _possibleConstructorReturn(this, (TopAccordionlayout.__proto__ || Object.getPrototypeOf(TopAccordionlayout)).call(this, props))
    }
    _createClass(TopAccordionlayout, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            _get(TopAccordionlayout.prototype.__proto__ || Object.getPrototypeOf(TopAccordionlayout.prototype), '__componentDidMount', this).call(this);
            this.__bindEvent()
        }
    }, {
        key: '__bindEvent',
        value: function __bindEvent() {
            Top.EventManager.on('click', this.dom.root, this.clickcallback.bind(this))
        }
    }, {
        key: 'clickcallback',
        value: function clickcallback(event) {
            var _this = this;
            var target = event.srcElement;
            var targetName = '';
            while (true) {
                if (target.tagName == undefined || target.tagName == null) {
                    return
                }
                var classList = Top.Util.__classStringToClassList(target.className);
                if (classList.includes('top-accordionlayout-title') && classList.includes('active')) {
                    targetName = 'titleActive';
                    break
                } else if (classList.includes('top-accordionlayout-title') && !classList.includes('active')) {
                    targetName = 'titleNonActive';
                    break
                }
                target = target.parentNode
            }
            ;if (targetName === 'titleActive') {
                var container = target.parentNode
                  , content = container.children[1];
                $(content).slideUp();
                var closed = target.parentNode.id.substring(20);
                target.classList.remove('active');
                this.selected = undefined;
                this.dom.active = undefined
            } else if (targetName === 'titleNonActive') {
                var container = target.parentNode
                  , content = container.children[1];
                $(content).slideDown();
                if (this.state.autoClose && this.dom.active) {
                    var activeTitle = this.dom.active
                      , activeContent = activeTitle.parentNode.children[1];
                    activeTitle.classList.remove('active');
                    $(activeContent).slideUp()
                }
                target.classList.add('active');
                this.dom.active = target;
                this.selected = target.parentNode.id.substring(20)
            }
        }
    }]);
    return TopAccordionlayout
}(TopAccordionlayoutUI);
TopAccordionlayoutUI.propConfigs = Object.assign({}, TopContainerBehavior.propConfigs, {
    title: {
        type: String
    },
    tabs: {
        type: Array,
        arrayOf: Object
    },
    items: {
        type: Array,
        arrayOf: Object
    },
    autoClose: {
        type: Boolean,
        options: [true, false],
        default: true
    }
});
TopAccordionlayoutUI.defaultProps = Object.assign({}, TopContainerBehavior.defaultProps, {
    tagName: 'top-accordionlayout'
});
TopAccordionlayout.propConfigs = Object.assign({}, TopAccordionlayoutUI.propConfigs, {});
TopAccordionlayout.defaultProps = Object.assign({}, TopAccordionlayoutUI.defaultProps, {});
TopUI.Widget.Container.Accordionlayout = function() {
    Accordionlayout.prototype = Object.create(TopUI.Widget.Container.prototype);
    Accordionlayout.prototype.constructor = Accordionlayout;
    function Accordionlayout(element, props) {
        if (element instanceof TopAccordionlayoutUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopAccordionlayoutUI, props)
        }
    }
    Accordionlayout.create = function(element, props) {
        return new Accordionlayout(element,props)
    }
    ;
    return Accordionlayout
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopAlarmbadgeUI = function(_TopTextstyleBehavior) {
    _inherits(TopAlarmbadgeUI, _TopTextstyleBehavior);
    function TopAlarmbadgeUI(props) {
        _classCallCheck(this, TopAlarmbadgeUI);
        return _possibleConstructorReturn(this, (TopAlarmbadgeUI.__proto__ || Object.getPrototypeOf(TopAlarmbadgeUI)).call(this, props))
    }
    _createClass(TopAlarmbadgeUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {
            var classTest = /(badge_01)|(badge_02)/g;
            if (!classTest.test(TopUI.Util.__classListToClassString(this.userClassList))) {
                TopUI.Util.__addClassToClassList(this.userClassList, 'badge_01')
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            var topIconClass = '';
            var topIconStyle = {};
            if (this.state.icon) {
                topIconClass += ' top-alarmbadge-icon ' + this.state.icon;
                topIconStyle['color'] = this.state.iconColor
            }
            var topTextClass = '';
            var topTextStyle = {};
            if (this.state.text) {
                topTextClass += ' top-alarmbadge-text ' + this.state.type;
                topTextStyle['color'] = this.state.textColor
            }
            return React.createElement('top-alarmbadge', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-alarmbadge-root',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('span', {
                className: topIconClass,
                style: topIconStyle
            }), React.createElement('span', {
                className: topTextClass,
                style: topTextStyle
            }, this.state.text)))
        }
    }]);
    return TopAlarmbadgeUI
}(TopTextstyleBehavior);
TopAlarmbadgeUI.propConfigs = Object.assign({}, TopTextstyleBehavior.propConfigs, {});
TopAlarmbadgeUI.defaultProps = Object.assign({}, TopTextstyleBehavior.defaultProps, {
    tagName: 'top-alarmbadge'
});
TopUI.Widget.Alarmbadge = function() {
    Alarmbadge.prototype = Object.create(TopUI.Widget.prototype);
    Alarmbadge.prototype.constructor = Alarmbadge;
    function Alarmbadge(element, props) {
        if (element instanceof TopAlarmbadgeUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopAlarmbadgeUI, props)
        }
    }
    Alarmbadge.create = function(element, props) {
        return new Alarmbadge(element,props)
    }
    ;
    return Alarmbadge
}();
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value"in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ("value"in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopBreadcrumbUI = function(_TopTextstyleBehavior) {
    _inherits(TopBreadcrumbUI, _TopTextstyleBehavior);
    function TopBreadcrumbUI(props) {
        _classCallCheck(this, TopBreadcrumbUI);
        return _possibleConstructorReturn(this, (TopBreadcrumbUI.__proto__ || Object.getPrototypeOf(TopBreadcrumbUI)).call(this, props))
    }
    _createClass(TopBreadcrumbUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {}
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {}
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {}
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "getElement",
        value: function getElement() {
            return this.dom.container
        }
    }, {
        key: "__initDomRef",
        value: function __initDomRef() {
            var _this2 = this;
            _get(TopBreadcrumbUI.prototype.__proto__ || Object.getPrototypeOf(TopBreadcrumbUI.prototype), "__initDomRef", this).call(this);
            this.dom.container = null;
            this.setContainerRef = function(element) {
                _this2.dom.container = element
            }
        }
    }, {
        key: "__renderNodes",
        value: function __renderNodes() {
            var _this3 = this;
            if (typeof this.state.nodes === "string") {
                var nodes = TopUI.Util.namespace(this.state.nodes, this)
            } else if (_typeof(this.state.nodes) === "object") {
                var nodes = this.state.nodes
            }
            return nodes.map(function(node, index, array) {
                var nodeSpanClass = index < array.length - 1 ? "top-breadcrumb-default" : "top-breadcrumb-current";
                return [node.selected ? React.createElement("a", {
                    key: _this3.state.id + "_node_" + index,
                    href: node.selected.startsWith("/") ? "javascript:TopUI.App.routeTo(\"" + node.selected + "\")" : node.selected
                }, React.createElement("span", {
                    key: _this3.state.id + "_node_" + index,
                    className: nodeSpanClass
                }, node.text)) : React.createElement("span", {
                    key: _this3.state.id + "_node_" + index,
                    className: nodeSpanClass
                }, node.text), index < array.length - 1 && React.createElement("span", {
                    key: _this3.state.id + "_divider_" + index,
                    className: "top-breadcrumb-divider"
                }, ">")]
            })
        }
    }, {
        key: "__render",
        value: function __render() {
            return React.createElement("top-breadcrumb", {
                id: this.state.id,
                ref: this.setTopRef,
                "class": this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement("div", {
                id: this.state.id,
                ref: this.setContainerRef,
                className: "top-breadcrumb-container basic"
            }, React.createElement("div", {
                ref: this.setRootRef,
                className: "top-breadcrumb-root",
                style: this.topStyle
            }, this.__renderNodes())))
        }
    }]);
    return TopBreadcrumbUI
}(TopTextstyleBehavior);
TopBreadcrumbUI.propConfigs = Object.assign({}, TopTextstyleBehavior.propConfigs, {});
TopBreadcrumbUI.defaultProps = Object.assign({}, TopTextstyleBehavior.defaultProps, {
    tagName: "top-breadcrumb"
});
TopUI.Widget.Breadcrumb = function() {
    Breadcrumb.prototype = Object.create(TopUI.Widget.prototype);
    Breadcrumb.prototype.constructor = Breadcrumb;
    function Breadcrumb(element, props) {
        if (element instanceof TopBreadcrumbUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopBreadcrumbUI, props)
        }
    }
    Breadcrumb.create = function(element, props) {
        return new Breadcrumb(element,props)
    }
    ;
    return Breadcrumb
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopButtonUI = function(_TopTextstyleBehavior) {
    _inherits(TopButtonUI, _TopTextstyleBehavior);
    function TopButtonUI(props) {
        _classCallCheck(this, TopButtonUI);
        return _possibleConstructorReturn(this, (TopButtonUI.__proto__ || Object.getPrototypeOf(TopButtonUI)).call(this, props))
    }
    _createClass(TopButtonUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            var topSpanClass = this.state.iconPosition;
            var topSpanStyle = {};
            if (this.state.icon) {
                topSpanClass += ' top-button-icon ' + this.state.icon + ' icon-set ';
                topSpanStyle['width'] = this.state.textSize
            }
            if (this.state.image) {
                topSpanClass += ' top-button-image ';
                topSpanStyle['backgroundImage'] = 'url(' + this.state.image + ')'
            }
            return React.createElement('top-button', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('button', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-button-root',
                type: 'button',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, (this.state.icon || this.state.image) && this.state.iconPosition === 'left' && React.createElement('span', {
                className: topSpanClass,
                style: topSpanStyle
            }), React.createElement('label', {
                className: 'top-button-text'
            }, this.state.text), (this.state.icon || this.state.image) && this.state.iconPosition === 'right' && React.createElement('span', {
                className: topSpanClass,
                style: topSpanStyle
            }), React.createElement('div', {
                className: 'top-button-tooltip-wrapper'
            })))
        }
    }]);
    return TopButtonUI
}(TopTextstyleBehavior);
TopButtonUI.propConfigs = Object.assign({}, TopTextstyleBehavior.propConfigs, {
    text: {
        type: String
    },
    iconPosition: {
        type: String,
        options: ['left', 'right'],
        default: 'left'
    },
    icon: {
        type: String
    },
    image: {
        type: String
    }
});
TopButtonUI.defaultProps = Object.assign({}, TopTextstyleBehavior.defaultProps, {
    tagName: 'top-button'
});
TopUI.Widget.Button = function() {
    Button.prototype = Object.create(TopUI.Widget.prototype);
    Button.prototype.constructor = Button;
    function Button(element, props) {
        if (element instanceof TopButtonUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopButtonUI, props)
        }
    }
    Button.create = function(element, props) {
        return new Button(element,props)
    }
    ;
    return Button
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopChartUI = function(_TopCommonstyleBehavi) {
    _inherits(TopChartUI, _TopCommonstyleBehavi);
    function TopChartUI(props) {
        _classCallCheck(this, TopChartUI);
        return _possibleConstructorReturn(this, (TopChartUI.__proto__ || Object.getPrototypeOf(TopChartUI)).call(this, props))
    }
    _createClass(TopChartUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-chart', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-chart-root',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }))
        }
    }]);
    return TopChartUI
}(TopCommonstyleBehavior);
TopChartUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {
    type: {
        type: String,
        default: 'line',
        options: ['line']
    },
    series: {
        type: Array,
        arrayOf: Object
    },
    option: {
        type: Object
    }
});
TopChartUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: 'top-chart'
});
TopUI.Widget.Chart = function() {
    Chart.prototype = Object.create(TopUI.Widget.prototype);
    Chart.prototype.constructor = Chart;
    function Chart(element, props) {
        if (element instanceof TopChartUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopChartUI, props)
        }
    }
    Chart.create = function(element, props) {
        return new Chart(element,props)
    }
    ;
    return Chart
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopCheckboxUI = function(_TopCheckBehavior) {
    _inherits(TopCheckboxUI, _TopCheckBehavior);
    function TopCheckboxUI(props) {
        _classCallCheck(this, TopCheckboxUI);
        return _possibleConstructorReturn(this, (TopCheckboxUI.__proto__ || Object.getPrototypeOf(TopCheckboxUI)).call(this, props))
    }
    _createClass(TopCheckboxUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'getElement',
        value: function getElement() {
            return this.dom.check
        }
    }, {
        key: 'getElementForSize',
        value: function getElementForSize() {
            return this.dom.text
        }
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;
            _get(TopCheckboxUI.prototype.__proto__ || Object.getPrototypeOf(TopCheckboxUI.prototype), '__initDomRef', this).call(this);
            this.dom.check = null;
            this.dom.text = null;
            this.setCheckRef = function(element) {
                _this2.dom.check = element
            }
            ;
            this.setTextRef = function(element) {
                _this2.dom.text = element
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();
            var topLabelClass = 'top-checkbox-text ' + this.state.checkPosition + ' ' + (topDisabled ? 'disabled ' : '');
            if (this.state.checked) {
                topLabelClass += 'checked'
            }
            var id = this.state.id + this._reactInternalFiber.key;
            return React.createElement('top-checkbox', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                disabled: topDisabled,
                style: this.topTagStyle
            }, React.createElement('input', {
                className: 'top-checkbox-check',
                id: id,
                ref: this.setCheckRef,
                type: 'checkbox',
                name: this.state.groupId,
                checked: this.state.checked,
                disabled: topDisabled
            }), React.createElement('label', {
                className: topLabelClass,
                ref: this.setTextRef,
                htmlFor: id,
                disabled: topDisabled,
                style: this.topStyle
            }, this.state.checkPosition === 'left' && React.createElement('i', {
                className: 'top-checkbox-icon'
            }), React.createElement('span', {
                style: this.topTextStyle
            }, this.state.text), this.state.checkPosition === 'right' && React.createElement('i', {
                className: 'top-checkbox-icon'
            })))
        }
    }]);
    return TopCheckboxUI
}(TopCheckBehavior);
TopCheckboxUI.propConfigs = Object.assign({}, TopCheckBehavior.propConfigs, {});
TopCheckboxUI.defaultProps = Object.assign({}, TopCheckBehavior.defaultProps, {
    tagName: 'top-checkbox'
});
TopUI.Widget.Checkbox = function() {
    Checkbox.prototype = Object.create(TopUI.Widget.prototype);
    Checkbox.prototype.constructor = Checkbox;
    function Checkbox(element, props) {
        if (element instanceof TopCheckboxUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopCheckboxUI, props)
        }
    }
    Checkbox.create = function(element, props) {
        return new Checkbox(element,props)
    }
    ;
    return Checkbox
}();
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value"in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopChipUI = function(_TopTextBehavior) {
    _inherits(TopChipUI, _TopTextBehavior);
    function TopChipUI(props) {
        _classCallCheck(this, TopChipUI);
        return _possibleConstructorReturn(this, (TopChipUI.__proto__ || Object.getPrototypeOf(TopChipUI)).call(this, props))
    }
    _createClass(TopChipUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {}
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {}
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {}
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "__renderChips",
        value: function __renderChips() {
            var _this2 = this;
            if (typeof this.state.chipItems === "string") {
                var chipItems = TopUI.Util.namespace(this.state.chipItems, this)
            } else if (_typeof(this.state.chipItems) === "object") {
                var chipItems = this.state.chipItems
            }
            if (!chipItems)
                return;
            var clearFlag = this.state.clear;
            return chipItems.map(function(item, index, array) {
                var topIconClass = "top-chip-icon " + item.icon;
                return React.createElement("div", {
                    className: "top-chip-box",
                    key: _this2.state.id + "_item_" + index
                }, React.createElement("div", {
                    className: "top-chip-content"
                }, item.icon && React.createElement("i", {
                    className: topIconClass
                }), React.createElement("span", null, item.text), _this2.state.clear && React.createElement("i", {
                    className: "top-chip-close"
                })))
            })
        }
    }, {
        key: "__render",
        value: function __render() {
            return React.createElement("top-chip", {
                id: this.state.id,
                ref: this.setTopRef,
                "class": this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement("div", {
                id: this.state.id,
                ref: this.setRootRef,
                className: "top-chip-root",
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement("form", {
                autoComplete: "off",
                onSubmit: function onSubmit(e) {
                    e.preventDefault()
                }
            }, this.__renderChips(), React.createElement("input", {
                className: "top-chip-text",
                type: "text"
            }), React.createElement("span", {
                className: "top-chip-icon"
            }))))
        }
    }]);
    return TopChipUI
}(TopTextBehavior);
TopChipUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {
    text: {
        type: String
    },
    chipItems: {
        type: Array,
        arrayOf: Object,
        default: []
    },
    clear: {
        type: Boolean,
        default: true,
        options: [true, false]
    }
});
TopChipUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
    tagName: "top-chip"
});
TopUI.Widget.Chip = function() {
    Chip.prototype = Object.create(TopUI.Widget.prototype);
    Chip.prototype.constructor = Chip;
    function Chip(element, props) {
        if (element instanceof TopChipUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopChipUI, props)
        }
    }
    Chip.create = function(element, props) {
        return new Chip(element,props)
    }
    ;
    return Chip
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value"in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopCodeeditorUI = function(_TopTextBehavior) {
    _inherits(TopCodeeditorUI, _TopTextBehavior);
    function TopCodeeditorUI(props) {
        _classCallCheck(this, TopCodeeditorUI);
        return _possibleConstructorReturn(this, (TopCodeeditorUI.__proto__ || Object.getPrototypeOf(TopCodeeditorUI)).call(this, props))
    }
    _createClass(TopCodeeditorUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {
            if (typeof this.state.customizedMode === "string") {
                var customizedMode = TopUI.Util.namespace(this.state.customizedMode, this)
            }
            if (this.state.autocomplete) {
                var extraKeyMap = {
                    "Ctrl-Space": "autocomplete"
                }
            } else {
                var extraKeyMap = null
            }
            this.codemirror = CodeMirror(this.dom.root, {
                mode: customizedMode ? customizedMode : this.state.mode,
                lineNumbers: this.state.lineNumber,
                firstLineNumber: this.state.firstLineNumber,
                lineWrapping: this.state.lineWrapping,
                extraKeys: extraKeyMap,
                readOnly: this.state.readOnly,
                theme: this.state.theme
            });
            this.__postCodeMirror()
        }
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {}
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {}
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "__postCodeMirror",
        value: function __postCodeMirror() {
            this.__updateText();
            this.__updateLineNumber()
        }
    }, {
        key: "__updateText",
        value: function __updateText() {
            this.codemirror.setValue(this.state.text)
        }
    }, {
        key: "__updateLineNumber",
        value: function __updateLineNumber() {
            this.codemirror.setOption("lineNumbers", this.state.lineNumber);
            if (this.state.lineNumber) {
                this.dom.root.querySelector(".CodeMirror-sizer").classList.add("lineNumber")
            } else {
                this.dom.root.querySelector(".CodeMirror-sizer").classList.remove("lineNumber")
            }
        }
    }, {
        key: "__updateFirstLineNumber",
        value: function __updateFirstLineNumber() {
            this.codemirror.setOption("firstLineNumber", this.state.firstLineNumber)
        }
    }, {
        key: "__updateLineWrapping",
        value: function __updateLineWrapping() {
            this.codemirror.setOption("lineWrapping", this.state.lineWrapping)
        }
    }, {
        key: "__updateMode",
        value: function __updateMode() {
            this.codemirror.setOption("mode", this.state.mode)
        }
    }, {
        key: "__updateCustomizedMode",
        value: function __updateCustomizedMode() {
            this.codemirror.setOption("customizedMode", this.state.customizedMode)
        }
    }, {
        key: "__updateAutocomplete",
        value: function __updateAutocomplete() {
            if (this.state.autocomplete) {
                var extraKeyMap = {
                    "Ctrl-Space": "autocomplete"
                }
            } else {
                var extraKeyMap = null
            }
            this.codemirror.setOption("extraKeys", extraKeyMap)
        }
    }, {
        key: "__updateReadOnly",
        value: function __updateReadOnly() {
            this.codemirror.setOption("readOnly", this.state.readOnly)
        }
    }, {
        key: "__updateTheme",
        value: function __updateTheme() {
            this.codemirror.setOption("theme", this.state.theme)
        }
    }, {
        key: "__render",
        value: function __render() {
            var topRootClass = "top-codeeditor-root";
            var topDisabled = this.__calculateDerivedDisabled();
            return React.createElement("top-codeeditor", {
                id: this.state.id,
                ref: this.setTopRef,
                "class": this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement("div", {
                id: this.state.id,
                ref: this.setRootRef,
                className: topRootClass,
                disabled: topDisabled,
                style: this.topStyle
            }))
        }
    }]);
    return TopCodeeditorUI
}(TopTextBehavior);
TopCodeeditorUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {
    text: {
        type: String
    },
    lineNumber: {
        type: Boolean,
        default: false,
        options: [true, false]
    },
    firstLineNumber: {
        type: Number,
        default: 1
    },
    lineWrapping: {
        type: Boolean,
        default: false,
        options: [true, false]
    },
    mode: {
        type: String,
        default: "javascript"
    },
    customizedMode: {
        type: String
    },
    autocomplete: {
        type: Boolean,
        default: false,
        options: [true, false]
    },
    readOnly: {
        type: Boolean,
        default: false,
        options: [true, false]
    },
    theme: {
        type: String,
        default: "default"
    }
});
TopCodeeditorUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
    tagName: "top-codeeditor"
});
TopUI.Widget.Codeeditor = function() {
    Codeeditor.prototype = Object.create(TopUI.Widget.prototype);
    Codeeditor.prototype.constructor = Codeeditor;
    function Codeeditor(element, props) {
        if (element instanceof TopCodeeditorUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopCodeeditorUI, props)
        }
    }
    Codeeditor.create = function(element, props) {
        return new Codeeditor(element,props)
    }
    ;
    return Codeeditor
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value"in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ("value"in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopColorpickerUI = function(_TopCommonstyleBehavi) {
    _inherits(TopColorpickerUI, _TopCommonstyleBehavi);
    function TopColorpickerUI(props) {
        _classCallCheck(this, TopColorpickerUI);
        var _this = _possibleConstructorReturn(this, (TopColorpickerUI.__proto__ || Object.getPrototypeOf(TopColorpickerUI)).call(this, props));
        _this.__updateAlpha();
        return _this
    }
    _createClass(TopColorpickerUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {}
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {}
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {}
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "getElement",
        value: function getElement() {
            return this.dom.button
        }
    }, {
        key: "__initDomRef",
        value: function __initDomRef() {
            var _this2 = this;
            _get(TopColorpickerUI.prototype.__proto__ || Object.getPrototypeOf(TopColorpickerUI.prototype), "__initDomRef", this).call(this);
            this.dom.button = null;
            this.setButtonRef = function(element) {
                _this2.dom.button = element
            }
        }
    }, {
        key: "__rgbToHex",
        value: function __rgbToHex(R, G, B) {
            return this.__toHex(R) + this.__toHex(G) + this.__toHex(B)
        }
    }, {
        key: "__toHex",
        value: function __toHex(n) {
            n = parseInt(n, 10);
            if (isNaN(n))
                return "00";
            n = Math.max(0, Math.min(n, 255));
            return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16)
        }
    }, {
        key: "__hexToRgb",
        value: function __hexToRgb(hex) {
            hex = hex.replace("#", "");
            var value = hex.match(/[a-f\d]/gi);
            if (value.length == 3)
                hex = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
            value = hex.match(/[a-f\d]{2}/gi);
            if (value === null) {
                return {
                    r: 0,
                    g: 0,
                    b: 0
                }
            }
            var r = parseInt(value[0], 16);
            var g = parseInt(value[1], 16);
            var b = parseInt(value[2], 16);
            return {
                r: r,
                g: g,
                b: b
            }
        }
    }, {
        key: "__rgbToHsv",
        value: function __rgbToHsv(R, G, B) {
            var rr, gg, bb, r = R / 255, g = G / 255, b = B / 255, h, s, v = Math.max(r, g, b), diff = v - Math.min(r, g, b), diffc = function diffc(c) {
                return (v - c) / 6 / diff + 1 / 2
            };
            if (diff == 0) {
                h = s = 0
            } else {
                s = diff / v;
                rr = diffc(r);
                gg = diffc(g);
                bb = diffc(b);
                if (r === v) {
                    h = bb - gg
                } else if (g === v) {
                    h = 1 / 3 + rr - bb
                } else if (b === v) {
                    h = 2 / 3 + gg - rr
                }
                if (h < 0) {
                    h += 1
                } else if (h > 1) {
                    h -= 1
                }
            }
            return {
                h: Math.round(h * 360),
                s: Math.round(s * 100),
                v: Math.round(v * 100)
            }
        }
    }, {
        key: "__hsvToRgb",
        value: function __hsvToRgb(h, s, v) {
            var r, g, b;
            var i;
            var f, p, q, t;
            h = Math.max(0, Math.min(359, h));
            s = Math.max(0, Math.min(100, s));
            v = Math.max(0, Math.min(100, v));
            s /= 100;
            v /= 100;
            if (s === 0) {
                r = g = b = v;
                return {
                    r: Math.round(r * 255),
                    g: Math.round(g * 255),
                    b: Math.round(b * 255)
                }
            }
            if (v === 0) {
                return {
                    r: 0,
                    g: 0,
                    b: 0
                }
            }
            h /= 60;
            i = Math.floor(h);
            f = h - i;
            p = v * (1 - s);
            q = v * (1 - s * f);
            t = v * (1 - s * (1 - f));
            switch (i) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            default:
                r = v;
                g = p;
                b = q;
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            }
        }
    }, {
        key: "__rgbToRgba",
        value: function __rgbToRgba(r, g, b) {
            var a = this.state.rgba ? this.state.rgba.a : this.state.alpha ? this.state.alpha : 1;
            return {
                r: r,
                g: g,
                b: b,
                a: a
            }
        }
    }, {
        key: "__updateAlpha",
        value: function __updateAlpha() {
            if (this.state.alpha) {
                this.state.__color.a = this.state.alpha
            }
        }
    }, {
        key: "__getRgbaString",
        value: function __getRgbaString() {
            return "rgba(" + this.state.__color.r + "," + this.state.__color.g + "," + this.state.__color.b + "," + this.state.__color.a + ")"
        }
    }, {
        key: "__setColor",
        value: function __setColor() {
            if (this.state.rgba) {
                return this.state.rgba
            }
            if (this.state.rgb) {
                return this.__rgbToRgba(this.state.rgb.r, this.state.rgb.g, this.state.rgb.b)
            }
            if (this.state.hsv) {
                var rgb = this.__hsvToRgb(this.state.hsv.h, this.state.hsv.s, this.state.hsv.v);
                return this.__rgbToRgba(rgb.r, rgb.g, rgb.b)
            }
            if (this.state.hex) {
                var rgb = this.__hexToRgb(this.state.hex);
                return this.__rgbToRgba(rgb.r, rgb.g, rgb.b)
            }
            return this.state.__color
        }
    }, {
        key: "__renderPreview",
        value: function __renderPreview() {
            this.setTopStyle("backgroundColor", this.__getRgbaString())
        }
    }, {
        key: "__render",
        value: function __render() {
            this.state.__color = this.__setColor();
            this.__renderPreview();
            return React.createElement("top-colorpicker", {
                id: this.state.id,
                ref: this.setTopRef,
                "class": this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement("button", {
                id: this.state.id,
                ref: this.setButtonRef,
                className: "top-colorpicker-button",
                type: "button",
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }))
        }
    }]);
    return TopColorpickerUI
}(TopCommonstyleBehavior);
TopColorpickerUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {
    hex: {
        type: String,
        convert: function convert(value) {
            if (!value)
                return value;
            value = value.replace(/#/, "");
            var isHexNumber = value.match(/[A-Fa-f0-9]{6}/g);
            return isHexNumber ? value : "ffffff"
        }
    },
    rgb: {
        type: Object
    },
    rgba: {
        type: Object
    },
    hsv: {
        type: Object
    },
    alpha: {
        type: Number,
        default: 1
    },
    __color: {
        type: Object,
        default: {
            r: 255,
            g: 255,
            b: 255,
            a: 1
        }
    },
    onSelect: {
        type: Function
    }
});
TopColorpickerUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: "top-colorpicker"
});
TopUI.Widget.Colorpicker = function() {
    Colorpicker.prototype = Object.create(TopUI.Widget.prototype);
    Colorpicker.prototype.constructor = Colorpicker;
    function Colorpicker(element, props) {
        if (element instanceof TopColorpickerUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopColorpickerUI, props)
        }
    }
    Colorpicker.create = function(element, props) {
        return new Colorpicker(element,props)
    }
    ;
    return Colorpicker
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopDatepickerUI = function(_TopTextBehavior) {
    _inherits(TopDatepickerUI, _TopTextBehavior);
    function TopDatepickerUI(props) {
        _classCallCheck(this, TopDatepickerUI);
        return _possibleConstructorReturn(this, (TopDatepickerUI.__proto__ || Object.getPrototypeOf(TopDatepickerUI)).call(this, props))
    }
    _createClass(TopDatepickerUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            this.setState({
                date: e.target.value
            })
        }
    }, {
        key: '__render',
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();
            return React.createElement('top-datepicker', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-datepicker-root',
                style: this.topStyle
            }, React.createElement('input', {
                className: 'top-datepicker-input',
                disabled: topDisabled,
                value: this.state.date
            }), React.createElement('i', {
                className: 'top-datepicker-icon'
            })))
        }
    }]);
    return TopDatepickerUI
}(TopTextBehavior);
TopDatepickerUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {});
TopDatepickerUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
    tagName: 'top-datepicker'
});
TopUI.Widget.Datepicker = function() {
    Datepicker.prototype = Object.create(TopUI.Widget.prototype);
    Datepicker.prototype.constructor = Datepicker;
    function Datepicker(element, props) {
        if (element instanceof TopDatepickerUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopDatepickerUI, props)
        }
    }
    Datepicker.create = function(element, props) {
        return new Datepicker(element,props)
    }
    ;
    return Datepicker
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopFlowlayoutUI = function(_TopLayoutBehavior) {
    _inherits(TopFlowlayoutUI, _TopLayoutBehavior);
    function TopFlowlayoutUI(props) {
        _classCallCheck(this, TopFlowlayoutUI);
        return _possibleConstructorReturn(this, (TopFlowlayoutUI.__proto__ || Object.getPrototypeOf(TopFlowlayoutUI)).call(this, props))
    }
    _createClass(TopFlowlayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;
            if (children) {
                children = React.Children.map(children, function(child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            this.addClassToTopClassList('flow-child');
                            this.topStyle.verticalAlign = 'top';
                            if (this.state.layoutWidth === 'match_parent')
                                this.__updateLayoutWidth('100%');
                            if (this.state.layoutHeight === 'match_parent')
                                this.__updateLayoutHeight('100%')
                        }
                    })
                })
            }
            return children
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-flowlayout', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-flowlayout-root',
                style: this.topStyle
            }, this.__setWrapperStyle(this.state.children)))
        }
    }]);
    return TopFlowlayoutUI
}(TopLayoutBehavior);
TopFlowlayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {});
TopFlowlayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-flowlayout'
});
TopUI.Widget.Layout.Flowlayout = function() {
    Flowlayout.prototype = Object.create(TopUI.Widget.Layout.prototype);
    Flowlayout.prototype.constructor = Flowlayout;
    function Flowlayout(element, props, childs) {
        if (element instanceof TopFlowlayoutUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopFlowlayoutUI, props, childs)
        }
    }
    Flowlayout.create = function(element, props, childs) {
        return new Flowlayout(element,props,childs)
    }
    ;
    return Flowlayout
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopFramelayoutUI = function(_TopLayoutBehavior) {
    _inherits(TopFramelayoutUI, _TopLayoutBehavior);
    function TopFramelayoutUI(props) {
        _classCallCheck(this, TopFramelayoutUI);
        return _possibleConstructorReturn(this, (TopFramelayoutUI.__proto__ || Object.getPrototypeOf(TopFramelayoutUI)).call(this, props))
    }
    _createClass(TopFramelayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;
            if (children) {
                children = React.Children.map(children, function(child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            this.topTagStyle.position = 'absolute';
                            this.topTagStyle.display = 'inline-block';
                            this.topTagStyle.verticalAlign = 'top';
                            var pWrapWidth = this.props.layoutParent.state.layoutWidth === 'wrap_content' || this.props.layoutParent.state.layoutWidth === 'auto'
                              , pWrapHeight = this.props.layoutParent.state.layoutHeight === 'wrap_content' || this.props.layoutParent.state.layoutHeight === 'auto';
                            var pPaddingWidth = (parseInt(this.props.layoutParent.state.paddingRight) || 0) + (parseInt(this.props.layoutParent.state.paddingLeft) || 0)
                              , pPaddingHeight = (parseInt(this.props.layoutParent.state.paddingTop) || 0) + (parseInt(this.props.layoutParent.state.paddingBottom) || 0);
                            if (this.state.layoutWidth === 'match_parent') {
                                if (pWrapWidth) {
                                    this.__updateLayoutWidth(parseInt(this.state.marginRight) + parseInt(this.state.marginLeft) + 'px')
                                } else {
                                    this.setTopTagStyle('width', 'calc(100% - ' + pPaddingWidth + 'px)');
                                    this.__updateLayoutWidth('100%')
                                }
                            } else if (this.state.layoutWidth && this.state.layoutWidth.includes('%')) {
                                this.setTopTagStyle('width', 'calc(' + this.state.layoutWidth + ' - ' + pPaddingWidth + 'px)');
                                this.__updateLayoutWidth('100%')
                            }
                            if (this.state.layoutHeight === 'match_parent') {
                                if (pWrapHeight) {
                                    this.__updateLayoutHeight(parseInt(this.state.marginTop) + parseInt(this.state.marginBottom) + 'px')
                                } else {
                                    this.setTopTagStyle('height', 'calc(100% - ' + pPaddingHeight + 'px)');
                                    this.__updateLayoutHeight('100%')
                                }
                            } else if (this.state.layoutHeight && this.state.layoutHeight.includes('%')) {
                                this.setTopTagStyle('height', 'calc(' + this.state.layoutHeight + ' - ' + pPaddingHeight + 'px)');
                                this.__updateLayoutHeight('100%')
                            }
                        }
                    })
                })
            }
            return children
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-framelayout', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-framelayout-root',
                style: this.topStyle
            }, this.__setWrapperStyle(this.state.children)))
        }
    }]);
    return TopFramelayoutUI
}(TopLayoutBehavior);
TopFramelayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {});
TopFramelayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-framelayout'
});
TopUI.Widget.Layout.Framelayout = function() {
    Framelayout.prototype = Object.create(TopUI.Widget.Layout.prototype);
    Framelayout.prototype.constructor = Framelayout;
    function Framelayout(element, props, childs) {
        if (element instanceof TopFramelayoutUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopFramelayoutUI, props, childs)
        }
    }
    Framelayout.create = function(element, props, childs) {
        return new Framelayout(element,props,childs)
    }
    ;
    return Framelayout
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopHtmleditorUI = function(_TopCommonstyleBehavi) {
    _inherits(TopHtmleditorUI, _TopCommonstyleBehavi);
    function TopHtmleditorUI(props) {
        _classCallCheck(this, TopHtmleditorUI);
        return _possibleConstructorReturn(this, (TopHtmleditorUI.__proto__ || Object.getPrototypeOf(TopHtmleditorUI)).call(this, props))
    }
    _createClass(TopHtmleditorUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.__initHtmleditor()
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initHtmleditor',
        value: function __initHtmleditor() {
            $(this.dom.jqteRoot).jqte(this.__makeOptions())
        }
    }, {
        key: '__makeOptions',
        value: function __makeOptions() {
            return {
                format: this.state.format,
                fsize: this.state.fsize,
                fsizes: this.state.fsizes,
                color: this.state.color,
                b: this.state.b,
                i: this.state.i,
                u: this.state.u,
                ol: this.state.ol,
                ul: this.state.ul,
                sub: this.state.sub,
                sup: this.state.sup,
                indent: this.state.indent,
                outdent: this.state.outdent,
                left: this.state.left,
                center: this.state.center,
                right: this.state.right,
                strike: this.state.strike,
                link: this.state.link,
                unlink: this.state.unlink,
                remove: this.state.remove,
                rule: this.state.rule,
                source: this.state.source,
                placeholder: this.state.placeholder
            }
        }
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;
            _get(TopHtmleditorUI.prototype.__proto__ || Object.getPrototypeOf(TopHtmleditorUI.prototype), '__initDomRef', this).call(this);
            this.dom.jqteRoot = null;
            this.setJqteRoot = function(element) {
                _this2.dom.jqteRoot = element
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-htmleditor', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-htmleditor-root',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('div', {
                ref: this.setJqteRoot
            })))
        }
    }]);
    return TopHtmleditorUI
}(TopCommonstyleBehavior);
TopHtmleditorUI.propConfigs = {
    format: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    fsize: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    fsizes: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    color: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    b: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    i: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    u: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    ol: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    ul: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    sub: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    sup: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    indent: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    outdent: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    left: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    center: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    right: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    strike: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    link: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    unlink: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    remove: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    rule: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    source: {
        type: Boolean,
        default: true,
        options: [true, false]
    },
    placeholder: {
        type: String,
        default: ''
    }
};
TopHtmleditorUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {});
TopHtmleditorUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: 'top-htmleditor'
});
TopUI.Widget.Htmleditor = function() {
    Htmleditor.prototype = Object.create(TopUI.Widget.prototype);
    Htmleditor.prototype.constructor = Htmleditor;
    function Htmleditor(element, props) {
        if (element instanceof TopHtmleditorUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopHtmleditorUI, props)
        }
    }
    Htmleditor.create = function(element, props) {
        return new Htmleditor(element,props)
    }
    ;
    return Htmleditor
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopIconUI = function(_TopTextstyleBehavior) {
    _inherits(TopIconUI, _TopTextstyleBehavior);
    function TopIconUI(props) {
        _classCallCheck(this, TopIconUI);
        return _possibleConstructorReturn(this, (TopIconUI.__proto__ || Object.getPrototypeOf(TopIconUI)).call(this, props))
    }
    _createClass(TopIconUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            var topContentClassList = [];
            topContentClassList.push('top-icon-content');
            var iconClassCount = 0;
            for (var i = 0; i < this.topClassList.length; i++) {
                if (this.topClassList[i].match(/(icon-[A-Za-z0-9_-]+)/gm)) {
                    iconClassCount++;
                    if (iconClassCount > 1) {
                        topContentClassList.push(this.topClassList[i]);
                        this.removeClassFromTopClassList(this.topClassList[i])
                    }
                }
            }
            var topContentStyle = {};
            if (this.state.contentColor) {
                topContentStyle['color'] = this.state.contentColor
            }
            var topContentClass = TopUI.Util.__classListToClassString(topContentClassList);
            return React.createElement('top-icon', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('span', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-icon-root',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('i', {
                className: topContentClass,
                style: topContentStyle
            }, this.state.children)))
        }
    }]);
    return TopIconUI
}(TopTextstyleBehavior);
TopIconUI.propConfigs = Object.assign({}, TopTextstyleBehavior.propConfigs, {});
TopIconUI.defaultProps = Object.assign({}, TopTextstyleBehavior.defaultProps, {
    tagName: 'top-icon'
});
TopUI.Widget.Icon = function() {
    Icon.prototype = Object.create(TopUI.Widget.prototype);
    Icon.prototype.constructor = Icon;
    function Icon(element, props) {
        if (element instanceof TopIconUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopIconUI, props)
        }
    }
    Icon.create = function(element, props) {
        return new Icon(element,props)
    }
    ;
    return Icon
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopImagebuttonUI = function(_TopCommonstyleBehavi) {
    _inherits(TopImagebuttonUI, _TopCommonstyleBehavi);
    function TopImagebuttonUI(props) {
        _classCallCheck(this, TopImagebuttonUI);
        return _possibleConstructorReturn(this, (TopImagebuttonUI.__proto__ || Object.getPrototypeOf(TopImagebuttonUI)).call(this, props))
    }
    _createClass(TopImagebuttonUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-imagebutton', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('input', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-imagebutton-root',
                type: 'image',
                src: this.state.src,
                alt: this.state.description,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }))
        }
    }]);
    return TopImagebuttonUI
}(TopCommonstyleBehavior);
TopImagebuttonUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {});
TopImagebuttonUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: 'top-imagebutton'
});
TopUI.Widget.Imagebutton = function() {
    Imagebutton.prototype = Object.create(TopUI.Widget.prototype);
    Imagebutton.prototype.constructor = Imagebutton;
    function Imagebutton(element, props) {
        if (element instanceof TopImagebuttonUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopImagebuttonUI, props)
        }
    }
    Imagebutton.create = function(element, props) {
        return new Imagebutton(element,props)
    }
    ;
    return Imagebutton
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopImagesliderUI = function(_TopCommonstyleBehavi) {
    _inherits(TopImagesliderUI, _TopCommonstyleBehavi);
    function TopImagesliderUI(props) {
        _classCallCheck(this, TopImagesliderUI);
        return _possibleConstructorReturn(this, (TopImagesliderUI.__proto__ || Object.getPrototypeOf(TopImagesliderUI)).call(this, props))
    }
    _createClass(TopImagesliderUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.__initBxSlider()
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;
            _get(TopImagesliderUI.prototype.__proto__ || Object.getPrototypeOf(TopImagesliderUI.prototype), '__initDomRef', this).call(this);
            this.dom.ul = null;
            this.setUlRef = function(element) {
                _this2.dom.ul = element
            }
        }
    }, {
        key: '__initWidgetItems',
        value: function __initWidgetItems() {
            var _this3 = this;
            var widgetItems = this.state.children;
            return widgetItems.map(function(item, index, array) {
                return React.createElement('li', {
                    key: _this3.state.id + '_item_' + index
                }, React.createElement('img', {
                    src: item.props.src,
                    url: item.props.src
                }))
            })
        }
    }, {
        key: '__initBxSlider',
        value: function __initBxSlider() {
            var widgetItems = this.state.children;
            if (widgetItems.length > 0) {
                $(this.dom.ul).bxSlider({
                    mode: this.state.mode,
                    auto: this.state.autoSlide,
                    speed: this.state.speed,
                    startSlide: this.state.startSlide,
                    randomStart: this.state.randomStart,
                    nextText: '',
                    prevText: ''
                })
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-imageslider', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-imageslider-root',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('ul', {
                className: 'top-imageslider-ul',
                ref: this.setUlRef
            }, this.__initWidgetItems())))
        }
    }]);
    return TopImagesliderUI
}(TopCommonstyleBehavior);
TopImagesliderUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {
    mode: {
        type: String,
        default: 'horizontal',
        options: ['horizontal', 'vertical', 'fade']
    },
    autoSlide: {
        type: Boolean,
        default: false,
        options: [true, false]
    },
    speed: {
        type: Number,
        default: 500
    },
    startSlide: {
        type: Number,
        default: 0
    },
    randomStart: {
        type: Boolean,
        default: false,
        options: [true, false]
    }
});
TopImagesliderUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: 'top-imageslider'
});
TopUI.Widget.Imageslider = function() {
    Imageslider.prototype = Object.create(TopUI.Widget.prototype);
    Imageslider.prototype.constructor = Imageslider;
    function Imageslider(element, props) {
        if (element instanceof TopImagesliderUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopImagesliderUI, props)
        }
    }
    Imageslider.create = function(element, props) {
        return new Imageslider(element,props)
    }
    ;
    return Imageslider
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopImageviewUI = function(_TopCommonstyleBehavi) {
    _inherits(TopImageviewUI, _TopCommonstyleBehavi);
    function TopImageviewUI(props) {
        _classCallCheck(this, TopImageviewUI);
        return _possibleConstructorReturn(this, (TopImageviewUI.__proto__ || Object.getPrototypeOf(TopImageviewUI)).call(this, props))
    }
    _createClass(TopImageviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-imageview', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('img', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-imageview-root',
                src: this.state.src,
                alt: this.state.description,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }))
        }
    }]);
    return TopImageviewUI
}(TopCommonstyleBehavior);
TopImageviewUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {});
TopImageviewUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: 'top-imageview'
});
TopUI.Widget.Imageview = function() {
    Imageview.prototype = Object.create(TopUI.Widget.prototype);
    Imageview.prototype.constructor = Imageview;
    function Imageview(element, props) {
        if (element instanceof TopImageviewUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopImageviewUI, props)
        }
    }
    Imageview.create = function(element, props) {
        return new Imageview(element,props)
    }
    ;
    return Imageview
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopLayoutUI = function(_TopLayoutBehavior) {
    _inherits(TopLayoutUI, _TopLayoutBehavior);
    function TopLayoutUI(props) {
        _classCallCheck(this, TopLayoutUI);
        return _possibleConstructorReturn(this, (TopLayoutUI.__proto__ || Object.getPrototypeOf(TopLayoutUI)).call(this, props))
    }
    _createClass(TopLayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;
            if (children) {
                children = React.Children.map(children, function(child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            this.topTagStyle.width = '100%';
                            this.topTagStyle.height = '100%';
                            this.topTagStyle.display = 'block';
                            if (this.state.layoutWidth === 'match_parent')
                                this.__updateLayoutWidth('100%');
                            if (this.state.layoutHeight === 'match_parent')
                                this.__updateLayoutHeight('100%')
                        }
                    })
                })
            }
            return children
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-layout', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-layout-root',
                style: this.topStyle
            }, this.__setWrapperStyle(this.state.children)))
        }
    }]);
    return TopLayoutUI
}(TopLayoutBehavior);
TopLayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {});
TopLayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-layout'
});
TopUI.Widget.Layout.Layout = function() {
    Layout.prototype = Object.create(TopUI.Widget.Layout.prototype);
    Layout.prototype.constructor = Layout;
    function Layout(element, props, childs) {
        if (element instanceof TopLayoutUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopLayoutUI, props, childs)
        }
    }
    Layout.create = function(element, props, childs) {
        return new Layout(element,props,childs)
    }
    ;
    return Layout
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopLinearlayoutUI = function(_TopLayoutBehavior) {
    _inherits(TopLinearlayoutUI, _TopLayoutBehavior);
    function TopLinearlayoutUI(props) {
        _classCallCheck(this, TopLinearlayoutUI);
        var _this2 = _possibleConstructorReturn(this, (TopLinearlayoutUI.__proto__ || Object.getPrototypeOf(TopLinearlayoutUI)).call(this, props));
        _this2.mountFlag = false;
        _this2.state.offsetHeight = 0;
        _this2.reRenderChildFlag = false;
        return _this2
    }
    _createClass(TopLinearlayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.__setWidgetSize();
            if (this.mountFlag === true && this.state.orientation === 'horizontal') {
                var height = this.getElementForSize().clientHeight - parseFloat(this.state.padding.paddingTop || '0') - parseFloat(this.state.padding.paddingBottom || '0');
                this.setState({
                    offsetHeight: height
                })
            }
            this.__setWidgetWeight()
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            if (this.reRenderChildFlag) {
                this.__reRenderChild();
                this.reRenderChildFlag = false
            }
            if (this.props.layoutParent) {
                var height = this.getElementForSize().clientHeight - parseFloat(this.state.padding.paddingTop || '0') - parseFloat(this.state.padding.paddingBottom || '0');
                if ((this.mountFlag === true || this.state.offsetHeight !== height) && this.state.orientation === 'horizontal') {
                    this.setState({
                        offsetHeight: height
                    })
                }
            }
            this.__setWidgetWeight()
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {
            this.mountFlag = false
        }
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'setShouldComplete',
        value: function setShouldComplete(child, key) {
            if (this.state.orientation === 'horizontal') {
                if (key === 'layoutWidth')
                    this.shouldComplete = true
            } else if (this.state.orientation === 'vertical') {
                if (key === 'layoutHeight')
                    this.shouldComplete = true
            }
        }
    }, {
        key: '__updateOrientation',
        value: function __updateOrientation() {
            this.reRenderChildFlag = true
        }
    }, {
        key: '__updateVerticalAlignment',
        value: function __updateVerticalAlignment() {
            this.reRenderChildFlag = true
        }
    }, {
        key: '__updateHorizontalAlignment',
        value: function __updateHorizontalAlignment() {
            this.reRenderChildFlag = true
        }
    }, {
        key: '__reRenderChild',
        value: function __reRenderChild() {
            this.__setWidgetSize();
            this.layoutChild.forEach(function(c) {
                console.log('update child', c);
                c.forceUpdate()
            })
        }
    }, {
        key: 'renderLayout',
        value: function renderLayout() {
            this.topStyle.overflow = 'hidden';
            if (this.state.orientation === 'vertical') {
                this.removeTopStyle('whiteSpace')
            } else {
                this.setTopStyle('whiteSpace', 'nowrap')
            }
            this.__setLineHeight()
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this3 = this;
            if (children) {
                children = React.Children.map(children, function(child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this3,
                        layoutFunction: function layoutFunction() {
                            if (this.props.layoutParent.state.orientation === 'vertical') {
                                this.removeClassFromTopClassList('linear-child-horizontal');
                                this.addClassToTopClassList('linear-child-vertical');
                                if (this.state.layoutWidth === 'match_parent')
                                    this.__updateLayoutWidth('100%');
                                var height = this.state.layoutHeight;
                                var horizontalAlignment = this.props.layoutParent.state.horizontalAlignment || 'left';
                                if (this.state.layoutHorizontalAlignment)
                                    horizontalAlignment = this.state.layoutHorizontalAlignment;
                                this.setTopTagStyle('textAlign', horizontalAlignment);
                                if (height && height.includes('%')) {
                                    this.setTopTagStyle('height', height);
                                    if (height.includes('%')) {
                                        this.__updateLayoutHeight('100%')
                                    }
                                }
                                this.removeTopTagStyle('lineHeight')
                            } else {
                                this.removeClassFromTopClassList('linear-child-vertical');
                                this.addClassToTopClassList('linear-child-horizontal');
                                if (this.state.layoutHeight === 'match_parent')
                                    this.__updateLayoutHeight('100%');
                                this.removeTopTagStyle('textAlign');
                                var verticalAlignment = this.props.layoutParent.state.verticalAlignment || 'top';
                                if (!this.state.layoutVerticalAlignment) {
                                    this.setTopStyle('verticalAlign', verticalAlignment)
                                }
                                this.setTopTagStyle('lineHeight', 'normal')
                            }
                        }
                    })
                })
            }
            return children
        }
    }, {
        key: '__setLineHeight',
        value: function __setLineHeight() {
            if (this.state.orientation === 'vertical') {
                if (this.topStyle.lineHeight !== 'normal') {
                    this.removeTopStyle('lineHeight')
                }
                return
            }
            if (this.state.offsetHeight === 0) {
                this.mountFlag = true;
                return
            }
            if (this.state.offsetHeight > 0) {
                this.setTopStyle('lineHeight', this.state.offsetHeight + 'px')
            }
        }
    }, {
        key: '__setWidgetSize',
        value: function __setWidgetSize() {
            if (this.state.children.length <= 0)
                return;
            var _this = this;
            var pHorizontal = this.state.orientation === 'horizontal';
            var pWrapWidth = !this.state.layoutWidth || this.state.layoutWidth === 'auto'
              , pWrapHeight = !this.state.layoutHeight || this.state.layoutHeight === 'auto';
            this.wSum = 0,
            this.hSum = 0,
            this.weightSum = 0;
            if (this.state.orientation === 'horizontal') {
                for (var i = 0, len = this.state.children.length; i < len; i++) {
                    (function(j) {
                        var item = _this.layoutChild[j];
                        var itemLayoutWidth = item.state.layoutWidth;
                        if (_this.layoutChild.length === 1 && (!itemLayoutWidth || itemLayoutWidth === 'auto' || itemLayoutWidth === 'wrap_content')) {
                            return
                        }
                        var iWidth = parseFloat(itemLayoutWidth);
                        if (!isNaN(iWidth)) {
                            var computedStyle = window.getComputedStyle(item.getElementForSize());
                            if (parseFloat(item.state.padding.paddingLeft || '0') + parseFloat(item.state.padding.paddingRight || '0') + parseFloat(item.getValidBorderLeftWidth()) + parseFloat(item.getValidBorderRightWidth()) > iWidth)
                                iWidth = parseFloat(item.state.padding.paddingLeft || '0') + parseFloat(item.state.padding.paddingRight || '0') + parseFloat(item.getValidBorderLeftWidth()) + parseFloat(item.getValidBorderRightWidth());
                            iWidth += parseFloat(item.state.marginLeft) + parseFloat(item.state.marginRight);
                            item.actualWidth = iWidth;
                            _this.wSum += iWidth
                        } else if (!itemLayoutWidth || itemLayoutWidth === 'auto' || itemLayoutWidth === 'wrap_content') {
                            if (typeof item.getElementForSize === 'function') {
                                var computedStyle = window.getComputedStyle(item.getElementForSize());
                                iWidth = parseFloat(computedStyle.width) || 0;
                                iWidth += parseFloat(item.state.marginLeft) + parseFloat(item.state.marginRight);
                                item.actualWidth = iWidth;
                                _this.wSum += iWidth
                            }
                        } else if (itemLayoutWidth === 'match_parent') {
                            var computedStyle = window.getComputedStyle(item.getElementForSize());
                            var iMargin = parseFloat(item.state.marginRight) + parseFloat(item.state.marginLeft);
                            if (pWrapWidth) {
                                var changedWidth = iMargin + 'px'
                            } else {
                                _this.wSum += iMargin;
                                var changedWidth = _this.wSum > 0 ? 'calc(100% - ' + _this.wSum + 'px)' : '100%'
                            }
                            item.setTopStyle('width', changedWidth);
                            item.forceUpdate();
                            if (!item.state.layoutWeight) {
                                _this.weightSum = 0;
                                return
                            }
                            _this.wSum += iMargin
                        }
                        var iWeight = parseFloat(item.state.layoutWeight);
                        if (!isNaN(iWeight))
                            _this.weightSum += iWeight
                    }
                    )(i)
                }
            } else {
                for (var i = 0, len = this.state.children.length; i < len; i++) {
                    (function(j) {
                        var item = _this.layoutChild[j];
                        var itemLayoutHeight = item.state.layoutHeight;
                        if (_this.layoutChild.length === 1 && (!itemLayoutHeight || itemLayoutHeight === 'auto' || itemLayoutHeight === 'wrap_content')) {
                            return
                        }
                        var iHeight = parseFloat(itemLayoutHeight);
                        if (!isNaN(iHeight)) {
                            var computedStyle = window.getComputedStyle(item.getElementForSize());
                            if (parseFloat(item.state.padding.paddingTop || '0') + parseFloat(item.state.padding.paddingBottom || '0') + parseFloat(item.getValidBorderTopWidth()) + parseFloat(item.getValidBorderBottomWidth()) > iHeight)
                                iHeight = parseFloat(item.state.padding.paddingTop || '0') + parseFloat(item.state.padding.paddingBottom || '0') + parseFloat(item.getValidBorderTopWidth()) + parseFloat(item.getValidBorderBottomWidth());
                            iHeight += parseFloat(item.state.marginTop) + parseFloat(item.state.marginBottom);
                            item.actualHeight = iHeight;
                            _this.hSum += iHeight
                        } else if (!itemLayoutHeight || itemLayoutHeight === 'auto' || itemLayoutHeight === 'wrap_content') {
                            if (typeof item.getElementForSize === 'function') {
                                var computedStyle = window.getComputedStyle(item.getElementForSize());
                                iHeight = parseFloat(computedStyle.height) || 0;
                                iHeight += parseFloat(item.state.marginTop) + parseFloat(item.state.marginBottom);
                                item.actualHeight = iHeight;
                                _this.hSum += iHeight
                            }
                        } else if (itemLayoutHeight === 'match_parent') {
                            var computedStyle = window.getComputedStyle(item.getElementForSize());
                            var iMargin = parseFloat(item.state.marginTop) + parseFloat(item.state.marginBottom);
                            if (pWrapHeight) {
                                var changedHeight = iMargin + 'px'
                            } else {
                                var changedHeight = iMargin > 0 ? 'calc(100% - ' + iMargin + 'px)' : '100%';
                                var changedHeight_topTag = _this.hSum > 0 ? 'calc(100% - ' + _this.hSum + 'px)' : '100%'
                            }
                            item.setTopStyle('height', changedHeight);
                            item.setTopTagStyle('height', changedHeight_topTag);
                            item.forceUpdate();
                            if (!item.state.layoutWeight) {
                                _this.weightSum = 0;
                                return
                            }
                            _this.hSum += iMargin
                        }
                        var iWeight = parseFloat(item.state.layoutWeight);
                        if (!isNaN(iWeight))
                            _this.weightSum += iWeight
                    }
                    )(i)
                }
            }
        }
    }, {
        key: '__setWidgetWeight',
        value: function __setWidgetWeight() {
            if (this.state.children.length <= 0 || this.weightSum <= 0)
                return;
            var _this = this;
            var layoutRoot = this.getElement();
            var whiteSpaceSize = 0;
            var rootSize = 0;
            if (this.state.orientation === 'vertical') {
                var pPadding = parseFloat(this.state.padding.paddingTop || '0') + parseFloat(this.state.padding.paddingBottom || '0');
                rootSize = layoutRoot.clientHeight - pPadding;
                whiteSpaceSize = rootSize;
                if (whiteSpaceSize <= 0 && !isNaN(parseFloat(this.state.layoutHeight))) {
                    whiteSpaceSize = parseFloat(this.state.layoutHeight) - pPadding
                }
                whiteSpaceSize -= this.hSum;
                if (whiteSpaceSize <= 0)
                    return;
                var weightRatio = whiteSpaceSize / this.weightSum;
                for (var i = 0; i < this.state.children.length; i++) {
                    (function(j) {
                        var item = _this.layoutChild[j];
                        if (item.state.layoutWeight) {
                            var itemHeight;
                            itemHeight = item.actualHeight;
                            itemHeight = itemHeight + weightRatio * parseFloat(item.state.layoutWeight);
                            itemHeight = itemHeight / rootSize * 100 + '%';
                            var minusValue = parseFloat(item.state.marginTop) || 0;
                            minusValue += parseFloat(item.state.marginBottom) || 0;
                            if (typeof item.getElementForSize === 'function' && item.getElementForSize().style.boxSizing !== 'border-box') {
                                minusValue += parseFloat(item.getValidBorderTopWidth()) || 0;
                                minusValue += parseFloat(item.getValidBorderBottomWidth()) || 0;
                                minusValue += parseFloat(item.state.padding.paddingTop || '0');
                                minusValue += parseFloat(item.state.padding.paddingBottom || '0')
                            }
                            item.setTopStyle('height', 'calc(100% - ' + minusValue + 'px)');
                            item.setTopTagStyle('height', itemHeight);
                            item.forceUpdate()
                        }
                    }
                    )(i)
                }
            } else {
                var pPadding = parseFloat(this.state.padding.paddingLeft || '0') + parseFloat(this.state.padding.paddingRight || '0');
                rootSize = layoutRoot.clientWidth - pPadding;
                whiteSpaceSize = rootSize;
                if (whiteSpaceSize <= 0 && !isNaN(parseFloat(this.state.layoutWidth))) {
                    whiteSpaceSize = parseFloat(this.state.layoutWidth) - pPadding
                }
                whiteSpaceSize -= this.wSum;
                if (whiteSpaceSize <= 0)
                    return;
                var weightRatio = whiteSpaceSize / this.weightSum;
                for (var i = 0; i < this.layoutChild.length; i++) {
                    (function(j) {
                        var item = _this.layoutChild[j];
                        if (item.state.layoutWeight) {
                            var itemWidth = item.actualWidth;
                            itemWidth = itemWidth + weightRatio * parseFloat(item.state.layoutWeight);
                            itemWidth = itemWidth / rootSize * 100 + '%';
                            if (!itemWidth) {
                                if (item.state.layoutWidth === 'auto' || !item.state.layoutWidth)
                                    itemWidth = '';
                                if (!isNaN(parseFloat(item.state.layoutWidth)))
                                    itemWidth = item.layoutWidth
                            }
                            item.setTopStyle('width', itemWidth);
                            item.forceUpdate()
                        }
                    }
                    )(i)
                }
            }
        }
    }, {
        key: 'getWidth',
        value: function getWidth() {
            return this.getElement().offsetWidth
        }
    }, {
        key: 'getHeight',
        value: function getHeight() {
            return this.getElement().offsetHeight
        }
    }, {
        key: 'addWidgetByIndex',
        value: function addWidgetByIndex(widget, i) {
            this.setState(function(state, props) {
                var changedchilds = [];
                Object.assign(changedchilds, state.children);
                if (changedchilds.indexOf(widget.reactElement) >= 0)
                    changedchilds.splice(changedchilds.indexOf(widget.reactElement), 1);
                if (widget.template) {
                    var properties = widget.template.state;
                    changedchilds.splice(i, 0, React.createElement(TopUI.Render.topWidgets[properties.tagName], properties, properties.children))
                } else if (widget.reactElement) {
                    changedchilds.splice(i, 0, widget.reactElement)
                }
                return {
                    children: changedchilds
                }
            });
            if (!widget.template)
                widget.template = TopUI.Dom.__selectImpl(this.getElement().querySelector(widget.reactElement.props.tagName + '#' + widget.reactElement.props.id))
        }
    }, {
        key: 'complete',
        value: function complete() {
            this.__componentDidMount()
        }
    }, {
        key: '__render',
        value: function __render() {
            this.renderLayout();
            var topRootClass = 'top-linearlayout-root ' + this.state.orientation;
            return React.createElement('top-linearlayout', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: topRootClass,
                style: this.topStyle
            }, this.__setWrapperStyle(this.state.children)))
        }
    }]);
    return TopLinearlayoutUI
}(TopLayoutBehavior);
TopLinearlayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {});
TopLinearlayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-linearlayout',
    orientation: 'horizontal',
    verticalAlignment: 'top'
});
TopUI.Widget.Layout.Linearlayout = function() {
    Linearlayout.prototype = Object.create(TopUI.Widget.Layout.prototype);
    Linearlayout.prototype.constructor = Linearlayout;
    function Linearlayout(element, props, childs) {
        if (element instanceof TopLinearlayoutUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopLinearlayoutUI, props, childs)
        }
    }
    Linearlayout.create = function(element, props, childs) {
        return new Linearlayout(element,props,childs)
    }
    ;
    Linearlayout.prototype.getWidth = function() {
        return this.template.getWidth()
    }
    ;
    Linearlayout.prototype.getHeight = function() {
        return this.template.getHeight()
    }
    ;
    Linearlayout.prototype.addWidgetByIndex = function(widget, index) {
        this.template.addWidgetByIndex(widget, index)
    }
    ;
    return Linearlayout
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopListviewUI = function(_TopContainerBehavior) {
    _inherits(TopListviewUI, _TopContainerBehavior);
    function TopListviewUI(props) {
        _classCallCheck(this, TopListviewUI);
        var _this = _possibleConstructorReturn(this, (TopListviewUI.__proto__ || Object.getPrototypeOf(TopListviewUI)).call(this, props));
        _this.listData = {
            widgetItems: []
        };
        _this.__initProperties();
        return _this
    }
    _createClass(TopListviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__renderChilds',
        value: function __renderChilds(childs, data) {
            function replaceBindingProp(tagName, properties, data, rowIndex) {
                var dataFieldRegExp = new RegExp('{[\\w.]+}','g');
                var matches = [];
                var newProps = {};
                if (!properties.id)
                    newProps.id = TopUI.Util.guid() + '_' + rowIndex;
                else
                    newProps.id = properties.id + '_' + rowIndex;
                for (var key in properties) {
                    if (key === 'children') {
                        var value = [];
                        var newChilds = [];
                        for (var i = 0; i < properties[key].length; i++) {
                            value.push(replaceBindingProp(properties[key][i].props.tagName, properties[key][i].props, data, i));
                            newChilds.push(replaceBindingProp(properties[key][i].props.tagName, properties[key][i].props, data, i))
                        }
                    } else if (key === 'id') {
                        continue
                    } else {
                        if (typeof properties[key] === 'string')
                            matches = properties[key].match(dataFieldRegExp);
                        if (matches && matches.length === 1) {
                            var fieldName = matches[0].substring(1, matches[0].length - 1);
                            var value = data[fieldName]
                        } else {
                            var value = properties[key]
                        }
                    }
                    newProps[key] = value
                }
                return TopUI.Widget.create(tagName, newProps, newChilds).reactElement
            }
            return childs.map(function(child, index, array) {
                return replaceBindingProp(child.props.tagName, child.props, data, index)
            })
        }
    }, {
        key: '__renderWidgetItems',
        value: function __renderWidgetItems(item, index, array) {
            var listId = 'list_' + index;
            var firstOrLast = index === 0 ? 'first-child' : index === array.length - 1 ? 'last-child' : '';
            var listClass = 'row_' + index + ' top-listview-list ' + firstOrLast;
            return React.createElement('li', {
                key: this.state.id + '_list_' + index,
                id: listId,
                className: listClass,
                'data-index': index
            }, item.props.children && item.props.children.length > 0 ? this.__renderChilds(item.props.children, {}) : item.props.text)
        }
    }, {
        key: '__renderData',
        value: function __renderData(childs, data, index, array) {
            var _this2 = this;
            var listId = 'list_' + index;
            var firstOrLast = index === 0 ? 'first-child' : index === array.length - 1 ? 'last-child' : '';
            var listClass = 'row_' + index + ' top-listview-list ' + firstOrLast;
            return React.createElement('li', {
                key: this.state.id + '_list_' + index,
                id: listId,
                className: listClass,
                'data-index': index
            }, childs[0].props.children.map(function(child, index) {
                return _this2.__renderChilds(child.props.children, data)
            }))
        }
    }, {
        key: '__updateDataModel',
        value: function __updateDataModel() {
            console.log('#UPDATE SOON#');
            this.state.items = this.state.dataModel.items;
            this.__updateItems()
        }
    }, {
        key: '__updateItems',
        value: function __updateItems() {
            this.listData.data = this.state.items
        }
    }, {
        key: '__updateRowItemsDomString',
        value: function __updateRowItemsDomString() {
            this.itemLayoutDom = undefined;
            this.itemLayoutDom = this.__makeStringtoDom(this.state.RowItemsDomString)
        }
    }, {
        key: '__makeStringtoDom',
        value: function __makeStringtoDom(itemsString) {
            var changedchilds = [];
            var wrapper = document.createElement('div');
            wrapper.innerHTML = itemsString;
            var itemsDom = wrapper.children;
            if (itemsDom.length) {
                for (var i = 0; i < itemsDom.length; i++) {
                    changedchilds.push(this.initializeHtmlObjects(itemsDom[i]))
                }
            } else {
                changedchilds.push(this.initializeHtmlObjects(itemsDom))
            }
            return changedchilds
        }
    }, {
        key: 'updateRowItemsDomString',
        value: function updateRowItemsDomString(itemsString) {
            var changedchilds = this.__makeStringtoDom(itemsString);
            this.setState({
                children: changedchilds
            })
        }
    }, {
        key: 'updateRowItemsDom',
        value: function updateRowItemsDom(itemsDom) {
            var changedchilds = [];
            if (itemsDom.length) {
                for (var i = 0; i < itemsDom.length; i++) {
                    changedchilds.push(this.initializeHtmlObjects(itemsDom[i]))
                }
            } else {
                changedchilds.push(this.initializeHtmlObjects(itemsDom))
            }
            this.setState({
                children: changedchilds
            })
        }
    }, {
        key: '__renderLayout',
        value: function __renderLayout(childs) {
            var _this3 = this;
            if (this.listData.widgetItems && this.listData.widgetItems.length > 0) {
                return this.listData.widgetItems.map(function(item, index, array) {
                    return _this3.__renderWidgetItems(item, index, array)
                })
            } else if (this.listData.data && this.listData.data.length > 0) {
                return this.listData.data.map(function(data, index, array) {
                    return _this3.__renderData(childs, data, index, array)
                })
            }
        }
    }, {
        key: '__initProperties',
        value: function __initProperties() {
            this.__updateItems();
            if (this.state.children) {
                for (var i = 0; i < this.state.children.length; i++) {
                    if (this.state.children[i].props.tagName === 'top-widgetitem') {
                        this.listData.widgetItems.push(this.state.children[i])
                    }
                }
            }
            if (this.state.children.length == 0) {
                this.state.children = this.__makeStringtoDom(this.state.RowItemsDomString)
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-listview', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-listview-root',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('ul', {
                'data-role': 'listview',
                'data-inset': 'true',
                className: 'top-listview-container'
            }, this.__renderLayout(this.state.children))))
        }
    }]);
    return TopListviewUI
}(TopContainerBehavior);
TopListviewUI.propConfigs = Object.assign({}, TopContainerBehavior.propConfigs, {
    items: {
        type: Array,
        default: []
    },
    RowItemsDomString: {
        type: String,
        default: '<top-rowitem id="RowItem" layout-width="match_parent" border-width="0px"><top-columnitem id="ColumnItem" border-width="0px"></top-columnitem></top-rowitem>'
    }
});
TopListviewUI.defaultProps = Object.assign({}, TopContainerBehavior.defaultProps, {
    tagName: 'top-listview'
});
TopUI.Widget.Container.Listview = function() {
    Listview.prototype = Object.create(TopUI.Widget.Container.prototype);
    Listview.prototype.constructor = Listview;
    function Listview(element, props) {
        if (element instanceof TopListviewUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopListviewUI, props)
        }
    }
    Listview.create = function(element, props) {
        return new Listview(element,props)
    }
    ;
    Listview.prototype.updateRowItemsDom = function(node) {
        this.template.updateRowItemsDom(node)
    }
    ;
    Listview.prototype.updateRowItemsDomString = function(string) {
        this.template.updateRowItemsDomString(string)
    }
    ;
    return Listview
}();
var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopMenuUI = function(_TopMenuBehavior) {
    _inherits(TopMenuUI, _TopMenuBehavior);
    function TopMenuUI(props) {
        _classCallCheck(this, TopMenuUI);
        return _possibleConstructorReturn(this, (TopMenuUI.__proto__ || Object.getPrototypeOf(TopMenuUI)).call(this, props))
    }
    _createClass(TopMenuUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            var mountFuncName = '__mount' + TopUI.Util.capitalizeFirstLetter(this.state.type);
            if (typeof this[mountFuncName] === 'function')
                this[mountFuncName]()
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            var mountFuncName = '__mount' + TopUI.Util.capitalizeFirstLetter(this.state.type);
            var floatingRoot = this.dom.top.querySelector('.top-menu-root.Menu_type_floating');
            if (this.state.type === 'floating') {
                if (!floatingRoot) {
                    this[mountFuncName]()
                } else {
                    for (key in this.topStyle) {
                        if (this.topStyle[key]) {
                            floatingRoot.style[key] = this.topStyle[key]
                        }
                    }
                }
            } else {
                if (floatingRoot) {
                    this.dom.top.removeChild(floatingRoot)
                }
            }
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {
            var classTest = /(menu_01)|(menu_02)/g;
            if (this.state.type === 'side' && !classTest.test(TopUI.Util.__classListToClassString(this.userClassList))) {
                TopUI.Util.__addClassToClassList(this.userClassList, 'menu_01')
            }
        }
    }, {
        key: '__setMenuLayout',
        value: function __setMenuLayout(item) {
            return React.createElement('a', {
                className: 'top-menu_item_inner'
            }, this.state.menuLayout)
        }
    }, {
        key: '__getAnchor',
        value: function __getAnchor(item) {
            var id = item.id ? 'top-menu_' + this.state.id + '_' + item.id : '';
            var className = 'top-menu_item_inner inner_depth1 ' + id;
            var iconClass = 'top-menu_icon icon_depth1 ' + (item.icon ? item.icon : '');
            var iconStyle = {};
            if (!item.icon)
                iconStyle['paddingRight'] = '0px';
            var isMenu02 = this.userClassList.includes('menu_02') ? true : false;
            isMenu02 = this.state.sideType === 'shown' ? true : isMenu02;
            return [React.createElement('a', {
                key: 'a',
                className: className
            }, item.image ? React.createElement('img', {
                key: 'img',
                className: 'top-menu_image',
                src: item.image
            }) : React.createElement('i', {
                key: 'icon',
                className: iconClass,
                style: iconStyle
            }), React.createElement('span', {
                key: 'text',
                className: 'top-menu_text text_depth1'
            }, item.text), this.state.type === 'side' && isMenu02 && React.createElement('i', {
                key: 'arrow',
                className: 'top-menu_arrow icon-arrow_potab_down'
            })), this.state.type === 'header' && React.createElement('i', {
                key: 'arrow',
                className: 'top-menu_arrow icon-arrow_down'
            }), this.state.type === 'cascading' && React.createElement('i', {
                key: 'arrow',
                className: 'top-menu_arrow icon-arrow_filled_left'
            })]
        }
    }, {
        key: '__makeMenu',
        value: function __makeMenu() {
            var _this2 = this;
            return this.menuData.data.map(function(item, index, array) {
                var divider = (item.divider === true || item.divider) === 'true' ? ' divider ' : '';
                var itemLayoutId = item.itemLayoutId ? ' connected_layout ' : '';
                var className = (_this2.state.type === 'floating' ? '' : 'top-menu_item ') + (_this2.state.type === 'cascading' ? ' top-menu_parent ' : '') + ' depth1 ' + divider + itemLayoutId;
                return React.createElement('li', {
                    key: 'li_' + index,
                    className: className
                }, _this2.state.menuLayout ? _this2.__setMenuLayout(item) : _this2.__getAnchor(item))
            })
        }
    }, {
        key: '__mountFloating',
        value: function __mountFloating() {
            var root = this.dom.top;
            $(root.querySelector('ul')).slicknav({
                appendTo: this.dom.root,
                label: ''
            })
        }
    }, {
        key: '__renderHeader',
        value: function __renderHeader() {
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation') + ' placement_' + this.state.placement;
            var containerStyle = {};
            return React.createElement('div', {
                ref: this.setRootRef,
                className: topRootClass,
                id: this.state.id,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('div', {
                className: 'top-menu-root'
            }, React.createElement('div', {
                className: 'top-menu-container',
                style: containerStyle
            }, React.createElement('ul', {
                className: 'top-menu_nav'
            }, this.__makeMenu()))))
        }
    }, {
        key: '__renderDrawer',
        value: function __renderDrawer() {
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation') + ' placement_' + this.state.placement;
            var containerStyle = {};
            return React.createElement('div', {
                ref: this.setRootRef,
                className: topRootClass,
                id: this.state.id,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('div', {
                className: 'top-menu-root'
            }, React.createElement('div', {
                className: 'top-menu-container',
                style: containerStyle
            }, React.createElement('button', {
                className: 'top-menu_btn top-menu_open'
            }), React.createElement('ul', {
                className: 'top-menu_nav'
            }, this.__makeMenu()))))
        }
    }, {
        key: '__renderFloating',
        value: function __renderFloating() {
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation');
            var ulId = TopUI.Util.guid();
            return [React.createElement('div', {
                key: 'div',
                ref: this.setRootRef,
                className: topRootClass,
                id: this.state.id,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }), React.createElement('ul', {
                key: 'ul',
                id: ulId
            }, this.__makeMenu())]
        }
    }, {
        key: '__renderSide',
        value: function __renderSide() {
            var item = this.menuData.data;
            function getMaxWidth() {
                var maxText = '';
                for (var i = 0; i < item.length; i++) {
                    if (item[i].text.length > maxText.length) {
                        maxText = item[i].text
                    }
                }
                String.prototype.width = function() {
                    var f = '13px arial'
                      , o = $('<div>' + this + '</div>').css({
                        'position': 'absolute',
                        'float': 'left',
                        'white-space': 'nowrap',
                        'visibility': 'hidden',
                        'font': f
                    }).appendTo($('body'))
                      , w = o.width();
                    o.remove();
                    return w
                }
                ;
                return maxText.width() + 110
            }
            var isMenu02 = this.userClassList.includes('menu_02') ? true : false;
            isMenu02 = this.state.sideType === 'shown' ? true : isMenu02;
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation') + ' ' + (isMenu02 ? 'menu_02' : 'menu_01') + ' placement_' + this.state.placement;
            var containerStyle = {};
            if (isMenu02) {
                var maxWidth = getMaxWidth() + 'px';
                containerStyle['width'] = maxWidth;
                if (this.state.placement === 'right') {
                    containerStyle['marginLeft'] = '-' + maxWidth
                }
            } else {
                containerStyle['width'] = '50px'
            }
            return React.createElement('div', {
                ref: this.setRootRef,
                className: topRootClass,
                id: this.state.id,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('div', {
                className: 'top-menu-root'
            }, React.createElement('div', {
                className: 'top-menu-container',
                style: containerStyle
            }, React.createElement('ul', {
                className: 'top-menu_nav'
            }, this.__makeMenu()))))
        }
    }, {
        key: '__renderCascading',
        value: function __renderCascading() {
            var topMenuTitleIconClass = 'top-menu_title_icon ' + (this.state.icon ? this.state.icon : '');
            var topMenuTitleStyle = {};
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation');
            return React.createElement('div', {
                ref: this.setRootRef,
                className: topRootClass,
                id: this.state.id,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('div', {
                className: 'top-menu-root'
            }, React.createElement('ul', {
                className: 'top-menu_nav'
            }, this.__makeMenu())))
        }
    }, {
        key: '__renderDropdown',
        value: function __renderDropdown() {
            var topMenuTitleIconClass = 'top-menu_title_icon ' + (this.state.icon ? this.state.icon : '');
            var topMenuTitleStyle = {};
            var topRootClass = 'top-menu Menu_type_' + this.state.type + ' ' + (this.state.animation ? 'withAnimation' : 'withoutAnimation');
            return React.createElement('div', {
                ref: this.setRootRef,
                className: topRootClass,
                id: this.state.id,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('div', {
                className: 'top-menu-root'
            }, React.createElement('a', {
                className: 'top-menu_btn top-menu_collapsed',
                style: {
                    outline: 'none'
                }
            }, React.createElement('i', {
                className: topMenuTitleIconClass
            }), React.createElement('span', {
                className: 'top-menu_title',
                style: topMenuTitleStyle
            }, this.state.title), React.createElement('i', {
                className: 'icon-arrow_filled_down'
            })), React.createElement('ul', {
                className: 'top-menu_nav',
                style: {
                    display: 'none'
                }
            }, this.__makeMenu())))
        }
    }, {
        key: '__renderMenu',
        value: function __renderMenu() {
            var renderFuncName = '__render' + TopUI.Util.capitalizeFirstLetter(this.state.type);
            return this[renderFuncName]()
        }
    }, {
        key: '__initProperties',
        value: function __initProperties() {
            if (typeof this.state.items === 'string') {
                this.menuData.data = TopUI.Util.namespace(this.state.items, this);
                this.menuData.itemsString = this.state.items
            } else if (_typeof(this.state.items) === 'object') {
                this.menuData.data = this.state.items
            } else if (this.state.items === undefined) {
                this.menuData.data = []
            }
            if (this.state.children) {
                for (var i = 0; i < this.state.children.length; i++) {
                    if (this.state.children[i].props.tagName === 'top-menuitem') {
                        this.menuData.menuItems.push(this.state.children[i])
                    }
                }
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            this.__initProperties();
            if (this.state.placement === 'right') {
                this.state.layoutRight = '0px';
                this.__updateLayoutRight()
            }
            return React.createElement('top-menu', {
                ref: this.setTopRef,
                id: this.state.id,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, this.__renderMenu())
        }
    }]);
    return TopMenuUI
}(TopMenuBehavior);
TopMenuUI.propConfigs = Object.assign({}, TopMenuBehavior.propConfigs, {
    type: {
        type: String,
        options: ['floating', 'side', 'dropdown', 'drawer', 'header', 'cascading'],
        default: 'dropdown',
        aliases: ['menuType']
    },
    items: {
        type: Array,
        arrayOf: Object,
        default: []
    },
    animation: {
        type: Boolean,
        options: [true, false],
        default: false
    },
    placement: {
        type: String,
        options: ['left', 'right', 'vertical', 'horizontal'],
        default: 'left'
    },
    sideType: {
        type: String,
        options: ['hidden', 'shown'],
        default: 'hidden'
    }
});
TopMenuUI.defaultProps = Object.assign({}, TopMenuBehavior.defaultProps, {
    tagName: 'top-menu'
});
TopUI.Widget.Menu = function() {
    Menu.prototype = Object.create(TopUI.Widget.prototype);
    Menu.prototype.constructor = Menu;
    function Menu(element, props) {
        if (element instanceof TopMenuUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopMenuUI, props)
        }
    }
    Menu.create = function(element, props) {
        return new Menu(element,props)
    }
    ;
    return Menu
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value"in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopPaginationUI = function(_TopCommonstyleBehavi) {
    _inherits(TopPaginationUI, _TopCommonstyleBehavi);
    function TopPaginationUI(props) {
        _classCallCheck(this, TopPaginationUI);
        return _possibleConstructorReturn(this, (TopPaginationUI.__proto__ || Object.getPrototypeOf(TopPaginationUI)).call(this, props))
    }
    _createClass(TopPaginationUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {
            if (this.state.type !== "input") {
                $(this.dom.root).bootpag({
                    total: this.state.total,
                    page: this.state.page,
                    maxVisible: this.state.maxVisible,
                    firstLastUse: true,
                    first: " ",
                    last: " ",
                    next: " ",
                    prev: " ",
                    leaps: false
                })
            }
        }
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {}
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {}
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "handleChange",
        value: function handleChange(e) {
            this.setState({
                page: TopUI.Util.__getPropConfigs(this).page.type(e.target.value)
            })
        }
    }, {
        key: "href",
        value: function href(c) {
            return this.state.hrefSrc.replace(this.state.hrefVariable, c)
        }
    }, {
        key: "__render",
        value: function __render() {
            var lp = this.state.total > this.state.maxVisible ? Math.min(this.state.maxVisible + 1, this.state.total) : 2;
            return React.createElement("top-pagination", {
                type: this.state.type,
                id: this.state.id,
                ref: this.setTopRef,
                "class": this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement("div", {
                id: this.state.id,
                ref: this.setRootRef,
                className: "top-pagination-root",
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, this.state.type === "input" && React.createElement("ul", {
                className: "top-pagination-container"
            }, React.createElement("li", {
                "data-lp": "1",
                className: "first"
            }, React.createElement("a", {
                className: "cell_link",
                href: this.href(1)
            })), React.createElement("li", {
                "data-lp": "1",
                className: "prev"
            }, React.createElement("a", {
                className: "cell_link",
                href: this.href(1)
            })), React.createElement("li", {
                className: "cell"
            }, React.createElement("a", {
                className: "cell_link"
            }, React.createElement("input", {
                className: "cell_input",
                type: "number",
                min: "1",
                max: this.state.total,
                value: this.state.page
            }), "\xA0of ", this.state.total)), React.createElement("li", {
                "data-lp": lp,
                className: "next"
            }, React.createElement("a", {
                className: "cell_link",
                href: this.href(lp)
            })), React.createElement("li", {
                "data-lp": this.state.total,
                className: "last"
            }, React.createElement("a", {
                className: "cell_link",
                href: this.href(this.state.total)
            })))))
        }
    }]);
    return TopPaginationUI
}(TopCommonstyleBehavior);
TopPaginationUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {
    page: {
        type: Number,
        default: 1
    },
    total: {
        type: Number,
        default: 9
    },
    maxVisible: {
        type: Number,
        default: 5
    },
    type: {
        type: String,
        default: "basic",
        options: ["basic", "big", "input", "button"]
    },
    hrefSrc: {
        type: String,
        default: "javascript:void(0);"
    },
    herfVariable: {
        type: String,
        default: "{{number}}"
    }
});
TopPaginationUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: "top-pagination"
});
TopUI.Widget.Pagination = function() {
    Pagination.prototype = Object.create(TopUI.Widget.prototype);
    Pagination.prototype.constructor = Pagination;
    function Pagination(element, props) {
        if (element instanceof TopPaginationUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopPaginationUI, props)
        }
    }
    Pagination.create = function(element, props) {
        return new Pagination(element,props)
    }
    ;
    return Pagination
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopProgressbarUI = function(_TopRangeBehavior) {
    _inherits(TopProgressbarUI, _TopRangeBehavior);
    function TopProgressbarUI(props) {
        _classCallCheck(this, TopProgressbarUI);
        var _this = _possibleConstructorReturn(this, (TopProgressbarUI.__proto__ || Object.getPrototypeOf(TopProgressbarUI)).call(this, props));
        _this.__updateProgress();
        _this.__updateProgressColor();
        return _this
    }
    _createClass(TopProgressbarUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__updateProgress',
        value: function __updateProgress() {
            if (typeof this.state.progress === 'string') {
                if (this.state.progress.endsWith('%')) {
                    this.state.progress = Number(this.state.progress.slice(0, this.state.progress.indexOf('%'))) / 100
                } else {
                    this.state.progress = Number(this.state.progress)
                }
            }
        }
    }, {
        key: '__updateProgressColor',
        value: function __updateProgressColor() {}
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-progressbar', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-progressbar-root',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, this.state.indeterminate ? React.createElement('progress', {
                className: 'top-progressbar-progress'
            }) : React.createElement('progress', {
                className: 'top-progressbar-progress',
                value: this.state.progress
            })))
        }
    }]);
    return TopProgressbarUI
}(TopRangeBehavior);
TopProgressbarUI.propConfigs = Object.assign({}, TopRangeBehavior.propConfigs, {
    indeterminate: {
        type: Boolean,
        default: false,
        options: [true, false]
    },
    progress: {
        type: [Number, String],
        default: 0.5
    }
});
TopProgressbarUI.defaultProps = Object.assign({}, TopRangeBehavior.defaultProps, {
    tagName: 'top-progressbar'
});
TopUI.Widget.Progressbar = function() {
    Progressbar.prototype = Object.create(TopUI.Widget.prototype);
    Progressbar.prototype.constructor = Progressbar;
    function Progressbar(element, props) {
        if (element instanceof TopProgressbarUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopProgressbarUI, props)
        }
    }
    Progressbar.create = function(element, props) {
        return new Progressbar(element,props)
    }
    ;
    return Progressbar
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value"in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ("value"in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopRadiobuttonUI = function(_TopCheckBehavior) {
    _inherits(TopRadiobuttonUI, _TopCheckBehavior);
    function TopRadiobuttonUI(props) {
        _classCallCheck(this, TopRadiobuttonUI);
        return _possibleConstructorReturn(this, (TopRadiobuttonUI.__proto__ || Object.getPrototypeOf(TopRadiobuttonUI)).call(this, props))
    }
    _createClass(TopRadiobuttonUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {}
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {}
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {}
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "getElement",
        value: function getElement() {
            return this.dom.check
        }
    }, {
        key: "getElementForSize",
        value: function getElementForSize() {
            return this.dom.text
        }
    }, {
        key: "__initDomRef",
        value: function __initDomRef() {
            var _this2 = this;
            _get(TopRadiobuttonUI.prototype.__proto__ || Object.getPrototypeOf(TopRadiobuttonUI.prototype), "__initDomRef", this).call(this);
            this.dom.check = null;
            this.dom.text = null;
            this.setCheckRef = function(element) {
                _this2.dom.check = element
            }
            ;
            this.setTextRef = function(element) {
                _this2.dom.text = element
            }
        }
    }, {
        key: "handleChange",
        value: function handleChange(e) {
            this.setState({
                checked: e.target.checked
            });
            var group = $("[name='" + this.state.groupId + "']");
            for (var i = 0; i < group.length; i++) {
                var reactInstance = TopUI.Dom.__selectImpl(group[i].parentElement);
                if (this.state.id !== reactInstance.state.id) {
                    reactInstance.setState({
                        checked: !e.target.checked
                    })
                }
            }
        }
    }, {
        key: "__render",
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();
            var topLabelClass = "top-radiobutton-text " + this.state.checkPosition + " " + (topDisabled ? "disabled " : "");
            if (this.state.checked) {
                topLabelClass += "checked"
            }
            var id = this.state.id + this._reactInternalFiber.key;
            return React.createElement("top-radiobutton", {
                id: this.state.id,
                ref: this.setTopRef,
                "class": this.makeTopTagClassString(),
                disabled: topDisabled,
                style: this.topTagStyle
            }, React.createElement("input", {
                className: "top-radiobutton-check",
                ref: this.setCheckRef,
                id: id,
                type: "radio",
                name: this.state.groupId,
                checked: this.state.checked,
                disabled: topDisabled
            }), React.createElement("label", {
                className: topLabelClass,
                ref: this.setTextRef,
                htmlFor: id,
                disabled: topDisabled,
                style: this.topStyle
            }, this.state.checkPosition === "left" && React.createElement("i", {
                className: "top-radiobutton-icon"
            }), React.createElement("span", {
                style: this.topTextStyle
            }, this.state.text), this.state.checkPosition === "right" && React.createElement("i", {
                className: "top-radiobutton-icon"
            })))
        }
    }]);
    return TopRadiobuttonUI
}(TopCheckBehavior);
TopRadiobuttonUI.propConfigs = Object.assign({}, TopCheckBehavior.propConfigs, {});
TopRadiobuttonUI.defaultProps = Object.assign({}, TopCheckBehavior.defaultProps, {
    tagName: "top-radiobutton"
});
TopUI.Widget.Radiobutton = function() {
    Radiobutton.prototype = Object.create(TopUI.Widget.prototype);
    Radiobutton.prototype.constructor = Radiobutton;
    function Radiobutton(element, props) {
        if (element instanceof TopRadiobuttonUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopRadiobuttonUI, props)
        }
    }
    Radiobutton.create = function(element, props) {
        return new Radiobutton(element,props)
    }
    ;
    return Radiobutton
}();
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value"in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ("value"in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopSelectboxUI = function(_TopCommonstyleBehavi) {
    _inherits(TopSelectboxUI, _TopCommonstyleBehavi);
    function TopSelectboxUI(props) {
        _classCallCheck(this, TopSelectboxUI);
        return _possibleConstructorReturn(this, (TopSelectboxUI.__proto__ || Object.getPrototypeOf(TopSelectboxUI)).call(this, props))
    }
    _createClass(TopSelectboxUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {}
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {}
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {}
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "__initDomRef",
        value: function __initDomRef() {
            var _this2 = this;
            _get(TopSelectboxUI.prototype.__proto__ || Object.getPrototypeOf(TopSelectboxUI.prototype), "__initDomRef", this).call(this);
            this.dom.options = null;
            this.setOptionsRef = function(element) {
                _this2.dom.options = element
            }
        }
    }, {
        key: "getPaddingStyleObjectKey",
        value: function getPaddingStyleObjectKey() {
            return "spanTagStyle"
        }
    }, {
        key: "__initWidgetItems",
        value: function __initWidgetItems() {
            var widgetItems = this.state.children;
            return widgetItems.map(function(item, index, array) {
                return item.props.text
            })
        }
    }, {
        key: "__renderNodes",
        value: function __renderNodes() {
            if (this.state.children && this.state.children.length > 0) {
                this.state.nodes = this.__initWidgetItems()
            }
            if (typeof this.state.nodes === "string") {
                var nodes = TopUI.Util.namespace(this.state.nodes, this)
            } else if (_typeof(this.state.nodes) === "object") {
                var nodes = this.state.nodes
            }
            if (!nodes)
                return;
            return nodes.map(function(node, index, array) {
                var topOptionClass = "top-selectbox-option " + "option_" + index;
                return React.createElement("li", {
                    className: topOptionClass
                }, node)
            })
        }
    }, {
        key: "__render",
        value: function __render() {
            return React.createElement("top-selectbox", {
                id: this.state.id,
                ref: this.setTopRef,
                "class": this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement("div", {
                id: this.state.id,
                ref: this.setRootRef,
                className: "top-selectbox-root",
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement("ul", {
                className: "top-selectbox-options",
                ref: this.setOptionsRef
            }, React.createElement("li", {
                className: "top-selectbox-option title"
            }, this.state.title), this.__renderNodes()), React.createElement("span", {
                className: "top-selectbox-container top-selectbox_collapsed",
                style: this.spanTagStyle
            }, React.createElement("i", {
                className: "top-selectbox-icon icon-arrow_filled_down"
            }), this.state.title)))
        }
    }]);
    return TopSelectboxUI
}(TopCommonstyleBehavior);
TopSelectboxUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {
    title: {
        type: String
    },
    nodes: {
        type: Array,
        arrayOf: String
    }
});
TopSelectboxUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: "top-selectbox"
});
TopUI.Widget.Container.Selectbox = function() {
    Selectbox.prototype = Object.create(TopUI.Widget.Container.prototype);
    Selectbox.prototype.constructor = Selectbox;
    function Selectbox(element, props) {
        if (element instanceof TopSelectboxUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopSelectboxUI, props)
        }
    }
    Selectbox.create = function(element, props) {
        return new Selectbox(element,props)
    }
    ;
    return Selectbox
}();
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value"in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function")
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }
    return call && (typeof call === "object" || typeof call === "function") ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopSliderUI = function(_TopRangeBehavior) {
    _inherits(TopSliderUI, _TopRangeBehavior);
    function TopSliderUI(props) {
        _classCallCheck(this, TopSliderUI);
        return _possibleConstructorReturn(this, (TopSliderUI.__proto__ || Object.getPrototypeOf(TopSliderUI)).call(this, props))
    }
    _createClass(TopSliderUI, [{
        key: "__componentDidMount",
        value: function __componentDidMount() {
            this.__initSlider()
        }
    }, {
        key: "__componentDidUpdate",
        value: function __componentDidUpdate() {}
    }, {
        key: "__componentWillUpdate",
        value: function __componentWillUpdate() {}
    }, {
        key: "__componentWillUnmount",
        value: function __componentWillUnmount() {}
    }, {
        key: "__updateNumber",
        value: function __updateNumber() {
            var number = this.__convertNumber();
            this.slider.set(number)
        }
    }, {
        key: "__updateMin",
        value: function __updateMin() {
            this.slider.updateOptions({
                range: {
                    "min": this.state.min,
                    "max": this.state.max
                }
            })
        }
    }, {
        key: "__updateMax",
        value: function __updateMax() {
            this.slider.updateOptions({
                range: {
                    "min": this.state.min,
                    "max": this.state.max
                }
            })
        }
    }, {
        key: "__updateStep",
        value: function __updateStep() {
            this.slider.updateOptions({
                step: this.state.step
            })
        }
    }, {
        key: "__updateOrientation",
        value: function __updateOrientation() {
            this.__updateDirection()
        }
    }, {
        key: "__updateDirection",
        value: function __updateDirection() {
            this.slider.destroy();
            this.__initSlider()
        }
    }, {
        key: "__convertNumber",
        value: function __convertNumber() {
            var number = this.state.number;
            number = number.length === 1 ? number[0] : number;
            if ((typeof number === "undefined" ? "undefined" : _typeof(number)) === "object" && number[0] > number[1])
                number = [number[1], number[0]];
            return number
        }
    }, {
        key: "__initSlider",
        value: function __initSlider() {
            var direction = this.state.direction;
            if (direction === "btt")
                direction = "rtl";
            else if (direction === "ttb")
                direction = "ltr";
            var connect = true
              , number = this.__convertNumber();
            if (!(number instanceof Array)) {
                connect = [true, false]
            }
            this.slider = noUiSlider.create(this.dom.root, {
                start: number,
                step: this.state.step,
                connect: connect,
                range: {
                    "min": this.state.min,
                    "max": this.state.max
                },
                orientation: this.state.orientation,
                direction: direction
            })
        }
    }, {
        key: "__render",
        value: function __render() {
            return React.createElement("top-slider", {
                id: this.state.id,
                ref: this.setTopRef,
                orientation: this.state.orientation,
                "class": this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement("div", {
                id: this.state.id,
                ref: this.setRootRef,
                className: "top-slider-root",
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }))
        }
    }]);
    return TopSliderUI
}(TopRangeBehavior);
TopSliderUI.propConfigs = Object.assign({}, TopRangeBehavior.propConfigs, {
    step: {
        type: Number,
        default: 1
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 100
    },
    number: {
        type: Array,
        default: [50],
        arrayOf: Number
    },
    orientation: {
        type: String,
        default: "horizontal",
        options: ["horizontal", "vertical"]
    },
    direction: {
        type: String,
        default: "ltr",
        options: ["ltr", "rtl", "btt", "ttb"]
    },
    onHandlechange: {
        type: String
    },
    onHandledragstart: {
        type: String
    },
    onHandledragend: {
        type: String
    }
});
TopSliderUI.defaultProps = Object.assign({}, TopRangeBehavior.defaultProps, {
    tagName: "top-slider"
});
TopUI.Widget.Slider = function() {
    Slider.prototype = Object.create(TopUI.Widget.prototype);
    Slider.prototype.constructor = Slider;
    function Slider(element, props) {
        if (element instanceof TopSliderUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopSliderUI, props)
        }
    }
    Slider.create = function(element, props) {
        return new Slider(element,props)
    }
    ;
    return Slider
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        })
    } else {
        obj[key] = value
    }
    return obj
}
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopSpinnerUI = function(_TopTextBehavior) {
    _inherits(TopSpinnerUI, _TopTextBehavior);
    function TopSpinnerUI(props) {
        _classCallCheck(this, TopSpinnerUI);
        return _possibleConstructorReturn(this, (TopSpinnerUI.__proto__ || Object.getPrototypeOf(TopSpinnerUI)).call(this, props))
    }
    _createClass(TopSpinnerUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            this.setState(_defineProperty({}, this.state.type, e.target.value))
        }
    }, {
        key: '__render',
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();
            return React.createElement('top-spinner', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-spinner-root',
                style: this.topStyle
            }, React.createElement('input', {
                className: 'top-spinner-input',
                type: 'text',
                disabled: topDisabled,
                value: this.state.type == 'time' ? this.state.time : this.state.number
            }), React.createElement('i', {
                className: 'top-spinner-button up'
            }), React.createElement('i', {
                className: 'top-spinner-button down'
            })))
        }
    }]);
    return TopSpinnerUI
}(TopTextBehavior);
TopSpinnerUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {
    type: {
        type: String,
        default: 'number',
        options: ['number', 'time']
    },
    step: {
        type: Number,
        default: 1
    },
    number: {
        type: Number,
        default: 0
    }
});
TopSpinnerUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
    tagName: 'top-spinner'
});
TopUI.Widget.Spinner = function() {
    Spinner.prototype = Object.create(TopUI.Widget.prototype);
    Spinner.prototype.constructor = Spinner;
    function Spinner(element, props) {
        if (element instanceof TopSpinnerUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopSpinnerUI, props)
        }
    }
    Spinner.create = function(element, props) {
        return new Spinner(element,props)
    }
    ;
    return Spinner
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopSplitterlayoutUI = function(_TopLayoutBehavior) {
    _inherits(TopSplitterlayoutUI, _TopLayoutBehavior);
    function TopSplitterlayoutUI(props) {
        _classCallCheck(this, TopSplitterlayoutUI);
        return _possibleConstructorReturn(this, (TopSplitterlayoutUI.__proto__ || Object.getPrototypeOf(TopSplitterlayoutUI)).call(this, props))
    }
    _createClass(TopSplitterlayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.adjustLayoutSize()
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            this.adjustLayoutSize()
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'adjustLayoutSize',
        value: function adjustLayoutSize() {
            var splitterWidth = splitterHeight = 0;
            var contents = this.dom.root.querySelectorAll('.top-splitterlayout-content');
            var splitter = this.dom.root.querySelector('.top-splitterlayout-splitter');
            if (contents) {
                var len = contents.length;
                for (var i = 0; i < len; i++) {
                    if (this.state.orientation === 'horizontal') {
                        contents[i].style.display = 'inline-block';
                        splitterWidth = splitter.offsetWidth;
                        var width = 'calc(' + parseInt(this.sizeArray[i]) / this.sizeSum * 100 + '% - ' + parseInt(splitterWidth / len) + 'px)';
                        contents[i].style.width = width;
                        contents[i].style.height = '100%';
                        if (i === len - 1) {
                            contents[i].style.left = splitterWidth + 'px'
                        }
                    } else {
                        splitterHeight = splitter.offsetHeight;
                        var height = 'calc(' + parseInt(this.sizeArray[i]) / this.sizeSum * 100 + '% - ' + parseInt(splitterHeight / len) + 'px)';
                        contents[i].style.height = height;
                        contents[i].style.width = '100%';
                        if (i === len - 1) {
                            contents[i].style.top = splitterHeight + 'px'
                        }
                    }
                }
            }
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this2 = this;
            if (children) {
                children = React.Children.map(children, function(child, index) {
                    return React.cloneElement(child, {
                        index: index,
                        layoutParent: _this2,
                        layoutFunction: function layoutFunction() {
                            var pWrapWidth = this.props.layoutParent.state.layoutWidth === 'auto' || this.props.layoutParent.state.layoutWidth === 'wrap_content';
                            var pWrapHeight = !this.props.layoutParent.state.layoutHeight || this.props.layoutParent.state.layoutHeight === 'auto' || this.props.layoutParent.state.layoutHeight === 'wrap_content';
                            if (this.state.layoutWidth === 'match_parent') {
                                if (pWrapWidth) {
                                    this.__updateLayoutWidth(parseInt(this.state.marginRight) + parseInt(this.state.marginLeft) + 'px')
                                } else {
                                    this.__updateLayoutWidth('100%')
                                }
                            }
                            if (this.state.layoutHeight === 'match_parent') {
                                if (pWrapHeight) {
                                    this.__updateLayoutHeight(parseInt(this.state.marginTop) + parseInt(this.state.marginBottom) + 'px')
                                } else {
                                    this.__updateLayoutHeight('100%')
                                }
                            }
                        }
                    })
                })
            }
            return children
        }
    }, {
        key: 'makeContentTag',
        value: function makeContentTag(index) {
            var contentClass = 'top-splitterlayout-content content_' + index;
            var contentStyle = {};
            if (this.state.orientation === 'horizontal')
                contentStyle.display = 'inline-block';
            return React.createElement('div', {
                className: contentClass,
                style: contentStyle
            }, this.__setWrapperStyle(this.state.children[index]))
        }
    }, {
        key: 'makeSplitterTag',
        value: function makeSplitterTag() {
            var splitterClass = 'top-splitterlayout-splitter ' + this.state.orientation;
            var splitterStyle = {};
            if (this.state.orientation === 'horizontal')
                splitterStyle.display = 'inline-block';
            return React.createElement('div', {
                className: splitterClass,
                style: splitterStyle
            })
        }
    }, {
        key: 'renderLayout',
        value: function renderLayout() {
            var sizeArray = [];
            var sizeSum = 0;
            sizeArray = this.state.ratio.split(':');
            for (var i = 0; i < sizeArray.length; i++) {
                if (sizeArray[i] === '')
                    sizeArray[i] = '0';
                var size = parseInt(sizeArray[i]);
                sizeSum += size
            }
            this.sizeArray = sizeArray;
            this.sizeSum = sizeSum;
            return React.createElement(React.Fragment, null, this.makeContentTag(0), this.makeSplitterTag(), this.makeContentTag(1))
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-splitterlayout', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-splitterlayout-root',
                style: this.topStyle
            }, this.renderLayout()))
        }
    }]);
    return TopSplitterlayoutUI
}(TopLayoutBehavior);
TopSplitterlayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {
    orientation: {
        type: String,
        options: ['horizontal', 'vertical'],
        default: 'vertical'
    },
    ratio: {
        type: String,
        default: '1:1'
    }
});
TopSplitterlayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-splitterlayout'
});
TopUI.Widget.Layout.Splitterlayout = function() {
    Splitterlayout.prototype = Object.create(TopUI.Widget.Layout.prototype);
    Splitterlayout.prototype.constructor = Splitterlayout;
    function Splitterlayout(element, props, childs) {
        if (element instanceof TopSplitterlayoutUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopSplitterlayoutUI, props, childs)
        }
    }
    Splitterlayout.create = function(element, props, childs) {
        return new Splitterlayout(element,props,childs)
    }
    ;
    return Splitterlayout
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i]
        }
        return arr2
    } else {
        return Array.from(arr)
    }
}
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopStepperUI = function(_TopTextstyleBehavior) {
    _inherits(TopStepperUI, _TopTextstyleBehavior);
    function TopStepperUI(props) {
        _classCallCheck(this, TopStepperUI);
        return _possibleConstructorReturn(this, (TopStepperUI.__proto__ || Object.getPrototypeOf(TopStepperUI)).call(this, props))
    }
    _createClass(TopStepperUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.state.svgWidth = this.dom.root.clientWidth;
            this.state.svgHeight = this.dom.root.clientHeight;
            if (typeof this.state.labels === 'string') {
                this.state.labels = TopUI.Util.namespace(this.state.labels, this)
            }
            this.updateSvgLine();
            this.updateSvgCircle();
            this.updateSvgLabels()
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this3 = this;
            _get(TopStepperUI.prototype.__proto__ || Object.getPrototypeOf(TopStepperUI.prototype), '__initDomRef', this).call(this);
            this.dom.lines = null;
            this.setLinesRef = function(element) {
                _this3.dom.lines = element
            }
            ;
            this.dom.circles = null;
            this.setCirclesRef = function(element) {
                _this3.dom.circles = element
            }
            ;
            this.dom.label = null;
            this.setLabelRef = function(element) {
                _this3.dom.label = element
            }
        }
    }, {
        key: '__initProperties',
        value: function __initProperties() {
            this.state.steps = parseInt(this.state.steps > 2 ? this.state.steps : 3);
            this.state.nodeIndex = 0;
            this.state.radius = parseFloat(this.state.radius);
            this.state.spacing = parseFloat(this.state.spacing)
        }
    }, {
        key: 'updateSvgLine',
        value: function updateSvgLine() {
            var _this4 = this;
            var lineCount = this.state.steps - 1;
            var height = this.state.svgHeight / 2;
            var width = this.state.svgWidth - this.state.spacing * 2 - this.state.radius * 2;
            var interval = width / lineCount;
            var startPoint = this.state.spacing + this.state.radius;
            var endPoint = void 0;
            var lineGenerator = d3.svg.line();
            var path = [].concat(_toConsumableArray(Array(lineCount))).map(function(item, index) {
                var newPath = [[startPoint, height], [startPoint + interval, height]];
                var pathString = d3.svg.line()(newPath);
                startPoint = startPoint + interval;
                return pathString
            });
            var svg = this.dom.root;
            var lineGroup = d3.select(svg).select('.top-stepper-lines');
            this.d3_line = lineGroup.selectAll('path').data(path);
            this.d3_line.exit().remove();
            this.d3_line.enter().append('path');
            this.d3_line.attr('class', function(d, i) {
                var stateClass = _this4.state.nodeIndex > i ? 'completed' : 'unfocused';
                return 'top-stepper-line stepper-line-' + i + ' ' + stateClass
            }).attr('d', function(d, i) {
                return d
            })
        }
    }, {
        key: 'updateSvgCircle',
        value: function updateSvgCircle() {
            var _this5 = this;
            var svg = this.dom.root;
            var circleCount = this.state.steps;
            var height = this.state.svgHeight / 2;
            var width = this.state.svgWidth - this.state.spacing * 2 - this.state.radius * 2;
            var interval = width / (circleCount - 1);
            var startPoint = this.state.spacing + this.state.radius;
            var endPoint = void 0;
            var points = [].concat(_toConsumableArray(Array(circleCount))).map(function(item, index) {
                var newPoint = [startPoint, height];
                startPoint = startPoint + interval;
                return newPoint
            });
            this.state.points = points;
            var circleGroup = d3.select(svg).select('.top-stepper-circles').select('.circles');
            this.d3_circle = circleGroup.selectAll('circle').data(points);
            this.d3_circle.exit().remove();
            this.d3_circle.enter().append('circle');
            this.d3_circle.attr('class', function(d, i) {
                var stateClass = 'unfocused';
                if (_this5.state.nodeIndex > i)
                    stateClass = 'completed';
                else if (_this5.state.nodeIndex == i)
                    stateClass = 'focused';
                return 'top-stepper-circle stepper-circle-' + i + ' ' + stateClass
            }).attr('r', this.state.radius).attr('cx', function(d, i) {
                return d[0]
            }).attr('cy', function(d, i) {
                return d[1]
            });
            var numberGroup = d3.select(svg).select('.top-stepper-circles').select('.numbers');
            this.d3_text = numberGroup.selectAll('text').data(points);
            this.d3_text.exit().remove();
            this.d3_text.enter().append('text');
            this.d3_text.attr('class', function(d, i) {
                var stateClass = 'stepper-number-' + i + ' unfocused';
                if (_this5.state.nodeIndex > i)
                    stateClass = 'completed';
                else if (_this5.state.nodeIndex == i)
                    stateClass = 'stepper-number-' + i + ' focused';
                return 'top-stepper-number + ' + stateClass
            }).text(function(d, i) {
                return _this5.state.nodeIndex <= i ? i + 1 : '\uE91B'
            }).attr('x', function(d, i) {
                if (_this5.state.nodeIndex <= i) {
                    return i > 8 ? d[0] - 10 : d[0] - 4
                } else {
                    return d[0] - 6
                }
            }).attr('y', function(d, i) {
                return d[1] + 6
            })
        }
    }, {
        key: 'updateSvgLabels',
        value: function updateSvgLabels() {
            var _this6 = this;
            var svg = this.dom.root;
            var labelsGroup = d3.select(svg).select('.top-stepper-labels');
            var points = this.state.points;
            this.d3_labels = labelsGroup.selectAll('text').data(points);
            this.d3_labels.exit().remove();
            this.d3_labels.enter().append('text');
            var _this = this;
            this.d3_labels.attr('class', function(d, i) {
                var stateClass = '';
                if (_this6.state.nodeIndex > i)
                    stateClass = 'completed';
                else if (_this6.state.nodeIndex == i)
                    stateClass = 'focused';
                else
                    stateClass = 'unfocused';
                return 'top-stepper-label stepper-label-' + i + ' ' + stateClass
            }).text(function(d, i) {
                return _this6.state.labels && _this6.state.labels[i] || undefined
            }).attr('x', function(d, i) {
                return _this.state.textAlign === 'left' ? d[0] - _this.state.radius : d[0] - this.textLength.baseVal.value / 2
            }).attr('y', function(d, i) {
                return d[1] + (_this6.state.radius + 20)
            })
        }
    }, {
        key: '__render',
        value: function __render() {
            this.__initProperties();
            return React.createElement('top-stepper', {
                ref: this.setTopRef,
                id: this.state.id,
                className: this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('svg', {
                ref: this.setRootRef,
                className: 'top-stepper-root',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('g', {
                ref: this.setLinesRef,
                className: 'top-stepper-lines'
            }), React.createElement('g', {
                ref: this.setCirclesRef,
                className: 'top-stepper-circles'
            }, React.createElement('g', {
                className: 'circles'
            }), React.createElement('g', {
                className: 'numbers'
            }), React.createElement('g', {
                ref: this.setLabelRef,
                className: 'top-stepper-labels'
            }))))
        }
    }]);
    return TopStepperUI
}(TopTextstyleBehavior);
TopStepperUI.propConfigs = Object.assign({}, TopTextstyleBehavior.propConfigs, {
    labels: {
        type: Array,
        arrayOf: String
    },
    spacing: {
        type: [Number, String],
        default: 0.5
    },
    radius: {
        type: [Number, String],
        default: 11.5
    }
});
TopStepperUI.defaultProps = Object.assign({}, TopTextstyleBehavior.defaultProps, {
    tagName: 'top-stepper'
});
TopUI.Widget.Stepper = function() {
    Stepper.prototype = Object.create(TopUI.Widget.prototype);
    Stepper.prototype.constructor = Stepper;
    function Stepper(element, props) {
        if (element instanceof TopStepperUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopStepperUI, props)
        }
    }
    Stepper.create = function(element, props) {
        return new Stepper(element,props)
    }
    ;
    return Stepper
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopSwitchUI = function(_TopCheckBehavior) {
    _inherits(TopSwitchUI, _TopCheckBehavior);
    function TopSwitchUI(props) {
        _classCallCheck(this, TopSwitchUI);
        return _possibleConstructorReturn(this, (TopSwitchUI.__proto__ || Object.getPrototypeOf(TopSwitchUI)).call(this, props))
    }
    _createClass(TopSwitchUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: 'getPaddingStyleObjectKey',
        value: function getPaddingStyleObjectKey() {
            return 'sliderTagStyle'
        }
    }, {
        key: '__render',
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();
            var id = this.state.id + this._reactInternalFiber.key;
            return React.createElement('top-switch', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                disabled: topDisabled,
                style: this.topTagStyle
            }, React.createElement('label', {
                className: 'top-switch-root',
                ref: this.setRootRef,
                htmlFor: id,
                style: this.topStyle
            }, React.createElement('input', {
                id: id,
                className: 'top-switch-background',
                type: 'checkbox',
                name: this.state.groupId,
                checked: this.state.checked,
                disabled: topDisabled
            }), React.createElement('div', {
                className: 'top-switch-slider',
                style: this.sliderTagStyle
            }, React.createElement('div', {
                className: 'top-switch-on'
            }, React.createElement('div', {
                className: 'top-switch-text'
            }, this.state.textOn)), React.createElement('div', {
                className: 'top-switch-off'
            }, React.createElement('div', {
                className: 'top-switch-text'
            }, this.state.textOff)))))
        }
    }]);
    return TopSwitchUI
}(TopCheckBehavior);
TopSwitchUI.propConfigs = Object.assign({}, TopCheckBehavior.propConfigs, {});
TopSwitchUI.defaultProps = Object.assign({}, TopCheckBehavior.defaultProps, {
    tagName: 'top-switch',
    textOn: 'On',
    textOff: 'Off'
});
TopUI.Widget.Switch = function() {
    Switch.prototype = Object.create(TopUI.Widget.prototype);
    Switch.prototype.constructor = Switch;
    function Switch(element, props) {
        if (element instanceof TopSwitchUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopSwitchUI, props)
        }
    }
    Switch.create = function(element, props) {
        return new Switch(element,props)
    }
    ;
    return Switch
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopTablayoutUI = function(_TopLayoutBehavior) {
    _inherits(TopTablayoutUI, _TopLayoutBehavior);
    function TopTablayoutUI(props) {
        _classCallCheck(this, TopTablayoutUI);
        var _this = _possibleConstructorReturn(this, (TopTablayoutUI.__proto__ || Object.getPrototypeOf(TopTablayoutUI)).call(this, props));
        _this.state.display_tab_length = -1;
        return _this
    }
    _createClass(TopTablayoutUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            if (this.state.children.length === 0 || this.state.tabs.length === 0)
                return;
            var display_tab_length = Math.floor(this.dom.container.clientWidth / this.dom.tr.children[1].clientWidth);
            if (display_tab_length > this.state.tabs.length + 1) {
                display_tab_length = this.state.tabs.length + 1
            }
            this.setState({
                display_tab_length: display_tab_length
            })
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            if (this.state.children.length === 0 || this.state.tabs.length === 0)
                return;
            if (this.reRenderChildFlag) {
                this.__reRenderChild();
                this.reRenderChildFlag = false
            }
            var display_tab_length = Math.floor(this.dom.container.clientWidth / this.dom.tr.children[1].clientWidth);
            if (display_tab_length > this.state.tabs.length + 1) {
                display_tab_length = this.state.tabs.length + 1
            }
            this.setState({
                display_tab_length: display_tab_length
            })
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;
            _get(TopTablayoutUI.prototype.__proto__ || Object.getPrototypeOf(TopTablayoutUI.prototype), '__initDomRef', this).call(this);
            this.dom.table = null;
            this.dom.tr = null;
            this.dom.container = null;
            this.setTableRef = function(element) {
                _this2.dom.table = element
            }
            ;
            this.setTrRef = function(element) {
                _this2.dom.tr = element
            }
            ;
            this.setContainerRef = function(element) {
                _this2.dom.container = element
            }
        }
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {
            var classTest = /(light)|(dark)|(tab_01)|(tab_02)|(tab_03)|(tab_04)/g;
            if (!classTest.test(TopUI.Util.__classListToClassString(this.userClassList))) {
                TopUI.Util.__addClassToClassList(this.userClassList, 'tab_01')
            }
        }
    }, {
        key: 'checkTabClassName',
        value: function checkTabClassName() {
            var tabClassName = '';
            var checkClass = [];
            checkClass.push(/\b(tab_01)\b/g);
            checkClass.push(/\b(tab_02)\b/g);
            checkClass.push(/\b(tab_03)\b/g);
            checkClass.push(/\b(tab_04)\b/g);
            checkClass.push(/\b(light)\b/g);
            checkClass.push(/\b(dark)\b/g);
            for (var i = 0; i < checkClass.length; i++) {
                if (checkClass[i].test(this.makeTopTagClassString())) {
                    var j = i + 1;
                    switch (i) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        {
                            tabClassName = 'tab_0' + j;
                            break
                        }
                    case 4:
                        {
                            tabClassName = 'light';
                            break
                        }
                    case 5:
                        {
                            tabClassName = 'dark';
                            break
                        }
                    }
                }
            }
            this.tabClassName = tabClassName
        }
    }, {
        key: 'renderLayout',
        value: function renderLayout() {
            var len = this.state.tabs.length;
            this.objTabs = {};
            for (var i = 0; i < len; i++) {
                this.objTabs[this.state.tabs[i].id] = this.state.tabs[i]
            }
        }
    }, {
        key: 'convertTabData',
        value: function convertTabData() {
            if (!this.state.tabs) {
                this.state.tabs = [];
                for (var i = 0; i < this.state.children.length; i++) {
                    var child = this.state.children[i];
                    if (child.props.layoutTabName) {
                        var tabName = child.props.layoutTabName;
                        var tabDisabed = child.props.layoutTabDisabed === 'true' || child.props.layoutTabDisabed === true ? true : false;
                        var current_id = this.state.id + '_' + tabName.replace(/ /g, '') + '_' + i;
                        if (child.props.layoutTabId !== undefined && child.props.layoutTabId !== null)
                            current_id = child.props.layoutTabId;
                        var closable = false;
                        if (child.props.layoutClosable)
                            closable = child.props.layoutClosable;
                        var image = null;
                        if (child.props.layoutTabIcon)
                            image = child.props.layoutTabIcon;
                        this.state.tabs.push({
                            id: current_id,
                            text: tabName,
                            layout: child,
                            disabled: tabDisabed,
                            __isCalled: false,
                            closable: closable,
                            image: image,
                            isLineHeightSet: false
                        })
                    }
                }
            }
        }
    }, {
        key: 'createTab',
        value: function createTab() {
            var tds = [];
            if (!isNaN(this.state.selected)) {
                var selectedIndex = Number(this.state.selected)
            } else {
                var selectedIndex = 0
            }
            for (var i = 0; i < this.state.tabs.length; i++) {
                var tdClassList = ['top-tablayout-tab-wrapper', 'tabs', this.tabClassName];
                if (this.state.tabs[i].disabled === true)
                    tdClassList.push('tab-disabled');
                var divClassList = ['top-tablayout-tab', 'tab_' + i, this.tabClassName];
                if (i === selectedIndex)
                    divClassList.push('active');
                var spanClassList = ['tab_text', this.tabClassName];
                var tdStyle = {};
                if (i < this.state.display_tab_length && i >= 0)
                    tdStyle.display = 'table-cell';
                else
                    tdStyle.display = 'none';
                var td = React.createElement('td', {
                    id: this.state.tabs[i].id,
                    key: i,
                    className: TopUI.Util.__classListToClassString(tdClassList),
                    tabIndex: this.state.tabIndex,
                    style: tdStyle
                }, React.createElement('div', {
                    className: TopUI.Util.__classListToClassString(divClassList)
                }, React.createElement('span', {
                    className: TopUI.Util.__classListToClassString(spanClassList)
                }, this.state.tabs[i].text), this.createCloseBtn(i), this.createCustomMenuBtn(i)));
                tds.push(td)
            }
            return React.createElement('table', {
                ref: this.setTableRef,
                cellSpacing: '0',
                cellPadding: '1',
                className: 'top-tablayout-table',
                width: '100%'
            }, React.createElement('tbody', null, React.createElement('tr', {
                ref: this.setTrRef
            }, this.createPaginationPre(), tds, this.createPaginationNext(), this.createPaginationPlus(), this.createLastTd())))
        }
    }, {
        key: 'createCloseBtn',
        value: function createCloseBtn(i) {
            if (this.state.tabs[i].closable === true || this.state.tabs[i].closable === 'true') {
                var spanClassList = ['close_btn', this.tabClassName];
                return React.createElement('span', {
                    className: TopUI.Util.__classListToClassString(spanClassList)
                })
            }
        }
    }, {
        key: 'createCustomMenuBtn',
        value: function createCustomMenuBtn(i) {
            if (!isNaN(this.state.selected)) {
                var selectedIndex = Number(this.state.selected)
            } else {
                var selectedIndex = 0
            }
            if (this.state.custommenu !== undefined) {
                var spanClassList = ['td_menu', this.tabClassName];
                var id = this.state.tabs[i].id + '_menuBtn';
                var spanStyle = {};
                if (this.state.tabs[i].closable === true || this.state.tabs[i].closable === 'true')
                    spanStyle.marginRight = '-25%';
                if (this.state.menuFocus === true && i === selectedIndex)
                    spanStyle.display = 'block';
                else
                    spanStyle.display = 'none';
                return React.createElement('span', {
                    id: id,
                    className: TopUI.Util.__classListToClassString(spanClassList),
                    style: spanStyle
                })
            }
        }
    }, {
        key: 'createPaginationPre',
        value: function createPaginationPre() {
            if (this.state.paginate === true) {
                var tdClassList = ['top-tablayout-tab-wrapper', 'top-tablayout-tab-btn', this.tabClassName];
                var tdStyle = {
                    display: 'none'
                };
                var divClassList = ['top-tablayout-prev', this.tabClassName];
                var spanClassList = ['list', this.tabClassName];
                var spanStyle = {
                    marginLeft: '-8px'
                };
                return React.createElement('td', {
                    className: TopUI.Util.__classListToClassString(tdClassList),
                    style: tdStyle,
                    key: 'paginate'
                }, React.createElement('div', {
                    className: TopUI.Util.__classListToClassString(divClassList)
                }, React.createElement('span', {
                    className: TopUI.Util.__classListToClassString(spanClassList),
                    style: spanStyle
                })))
            }
        }
    }, {
        key: 'createPaginationNext',
        value: function createPaginationNext() {
            if (this.state.paginate === true) {
                var tdClassList = ['top-tablayout-tab-wrapper', 'top-tablayout-tab-btn', this.tabClassName];
                var tdStyle = {
                    display: 'none'
                };
                var divClassList = ['top-tablayout-next', this.tabClassName];
                var spanClassList = ['list', this.tabClassName];
                var spanStyle = {
                    marginLeft: '8px'
                };
                return React.createElement('td', {
                    className: TopUI.Util.__classListToClassString(tdClassList),
                    style: tdStyle,
                    key: 'paginate'
                }, React.createElement('div', {
                    className: TopUI.Util.__classListToClassString(divClassList)
                }, React.createElement('span', {
                    className: TopUI.Util.__classListToClassString(spanClassList),
                    style: spanStyle
                })))
            }
        }
    }, {
        key: 'createPaginationPlus',
        value: function createPaginationPlus() {
            if (this.state.paginate === true) {
                var tdClassList = ['top-tablayout-tab-wrapper', this.tabClassName];
                var divClassList = ['top-tablayout-plus', this.tabClassName];
                var spanStyle = {
                    marginLeft: '-8px'
                };
                if (this.state.plusbutton === false)
                    spanStyle.display = 'none';
                return React.createElement('td', {
                    key: 'paginate',
                    className: TopUI.Util.__classListToClassString(tdClassList)
                }, React.createElement('div', {
                    className: TopUI.Util.__classListToClassString(divClassList)
                }, React.createElement('span', {
                    style: spanStyle
                })))
            }
        }
    }, {
        key: 'createLastTd',
        value: function createLastTd() {
            var tdId = this.state.id + '_right';
            var tdClassList = ['top-tablayout-tab', this.tabClassName, 'last'];
            return React.createElement('td', {
                id: tdId,
                width: '100%'
            }, React.createElement('div', {
                className: TopUI.Util.__classListToClassString(tdClassList)
            }))
        }
    }, {
        key: 'createPaginationPrevContainer',
        value: function createPaginationPrevContainer() {
            if (this.state.paginate === true) {
                var divClassList_1 = ['tab_paginate-prev-container', this.tabClassName];
                var divClassList_2 = ['tap_paginate-prev-list', this.tabClassName];
                var divStyle = {
                    display: 'none'
                };
                return React.createElement('div', {
                    className: TopUI.Util.__classListToClassString(divClassList_1)
                }, React.createElement('div', {
                    className: TopUI.Util.__classListToClassString(divClassList_2),
                    style: divStyle
                }))
            }
        }
    }, {
        key: 'createPaginateContainer',
        value: function createPaginateContainer() {
            if (this.state.paginate === true) {
                var divClassList_1 = ['tab_paginate-container', this.tabClassName];
                var divClassList_2 = ['tap_paginate-next-list', this.tabClassName];
                var divStyle = {
                    display: 'none'
                };
                return React.createElement('div', {
                    className: TopUI.Util.__classListToClassString(divClassList_1)
                }, React.createElement('div', {
                    className: TopUI.Util.__classListToClassString(divClassList_2),
                    style: divStyle
                }))
            }
        }
    }, {
        key: '__updateSelected',
        value: function __updateSelected() {
            this.reRenderChildFlag = true
        }
    }, {
        key: '__reRenderChild',
        value: function __reRenderChild() {
            this.layoutChild.forEach(function(c) {
                console.log('update child', c);
                c.forceUpdate()
            })
        }
    }, {
        key: '__setWrapperStyle',
        value: function __setWrapperStyle(children) {
            var _this3 = this;
            if (children) {
                var selectedId = typeof this.state.selected !== 'string' ? ['0'] : this.state.selected.split('_');
                var selectedTabIndex = parseInt(selectedId[selectedId.length - 1]);
                children = React.Children.map(children, function(child, index) {
                    var wrapperStyle = {};
                    if (index !== selectedTabIndex)
                        wrapperStyle.display = 'none';
                    return React.createElement('div', {
                        style: wrapperStyle
                    }, React.cloneElement(child, {
                        index: index,
                        layoutParent: _this3,
                        layoutFunction: function layoutFunction() {
                            var _this4 = this;
                            if (this.state.layoutWidth === 'match_parent')
                                this.__updateLayoutWidth('100%');
                            if (this.state.layoutHeight === 'match_parent')
                                this.__updateLayoutHeight('100%');
                            this.props.layoutParent.setState(function(state, props) {
                                var changedTabs = [];
                                Object.assign(changedTabs, state.tabs);
                                if (_this4.state.layoutTabName) {
                                    var tabName = _this4.state.layoutTabName;
                                    var tabDisabed = _this4.state.layoutTabDisabed === 'true' || _this4.state.layoutTabDisabed === true ? true : false;
                                    var current_id = _this4.props.layoutParent.state.id + '_' + tabName.replace(/ /g, '') + '_' + _this4.props.index;
                                    if (_this4.state.layoutTabId !== undefined && _this4.state.layoutTabId !== null)
                                        current_id = _this4.state.layoutTabId;
                                    var closable = false;
                                    if (_this4.state.layoutClosable)
                                        closable = _this4.state.layoutClosable;
                                    var image = null;
                                    if (_this4.state.layoutTabIcon)
                                        image = _this4.state.layoutTabIcon;
                                    changedTabs[_this4.props.index] = {
                                        id: current_id,
                                        text: tabName,
                                        layout: child,
                                        disabled: tabDisabed,
                                        __isCalled: false,
                                        closable: closable,
                                        image: image,
                                        isLineHeightSet: false
                                    }
                                }
                                return {
                                    tabs: changedTabs
                                }
                            })
                        }
                    }))
                })
            }
            return children
        }
    }, {
        key: '__render',
        value: function __render() {
            this.checkTabClassName();
            var containerClassName = 'top-tablayout-container ' + this.tabClassName;
            this.renderLayout();
            var childContainerStyle = {};
            if (this.dom.container) {
                childContainerStyle.height = 'calc(100% - ' + this.dom.container.clientHeight + 'px)'
            } else {
                childContainerStyle.height = 'calc(100% - 34px)'
            }
            return React.createElement('top-tablayout', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                name: this.state.name,
                ref: this.setRootRef,
                className: 'top-tablayout-root',
                style: this.topStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setContainerRef,
                className: containerClassName
            }, this.createPaginationPrevContainer(), this.createPaginateContainer(), this.createTab()), React.createElement('div', {
                className: 'top-tablayout-child-container',
                style: childContainerStyle
            }, this.__setWrapperStyle(this.state.children))))
        }
    }, {
        key: 'addWidget',
        value: function addWidget(widget, i) {
            this.setState(function(state, props) {
                var changedtabs = [];
                Object.assign(changedtabs, state.tabs);
                if (typeof i === 'number')
                    changedtabs.splice(i, 0, []);
                else
                    changedtabs.push([]);
                return {
                    tabs: changedtabs
                }
            });
            _get(TopTablayoutUI.prototype.__proto__ || Object.getPrototypeOf(TopTablayoutUI.prototype), 'addWidget', this).call(this, widget, i)
        }
    }, {
        key: 'removeWidget',
        value: function removeWidget(widget) {
            if (widget.reactElement) {
                var index = this.state.children.indexOf(widget.reactElement)
            } else if (widget.template) {
                var index = this.layoutChild.indexOf(widget.template)
            }
            _get(TopTablayoutUI.prototype.__proto__ || Object.getPrototypeOf(TopTablayoutUI.prototype), 'removeWidget', this).call(this, widget);
            this.setState(function(state, props) {
                var changedtabs = [];
                Object.assign(changedtabs, state.tabs);
                if (index > -1) {
                    changedtabs.splice(index, 1)
                }
                return {
                    tabs: changedtabs
                }
            })
        }
    }]);
    return TopTablayoutUI
}(TopLayoutBehavior);
TopTablayoutUI.propConfigs = Object.assign({}, TopLayoutBehavior.propConfigs, {
    tabs: {
        type: Array,
        default: []
    }
});
TopTablayoutUI.defaultProps = Object.assign({}, TopLayoutBehavior.defaultProps, {
    tagName: 'top-tablayout'
});
TopUI.Widget.Layout.Tablayout = function() {
    Tablayout.prototype = Object.create(TopUI.Widget.Layout.prototype);
    Tablayout.prototype.constructor = Tablayout;
    function Tablayout(element, props, childs) {
        if (element instanceof TopTablayoutUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopTablayoutUI, props, childs)
        }
    }
    Tablayout.create = function(element, props, childs) {
        return new Tablayout(element,props,childs)
    }
    ;
    return Tablayout
}();
var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function(obj) {
    return typeof obj
}
: function(obj) {
    return obj && typeof Symbol === 'function' && obj.constructor === Symbol && obj !== Symbol.prototype ? 'symbol' : typeof obj
}
;
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        })
    } else {
        obj[key] = value
    }
    return obj
}
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopTableviewUI = function(_TopContainerBehavior) {
    _inherits(TopTableviewUI, _TopContainerBehavior);
    function TopTableviewUI(props) {
        _classCallCheck(this, TopTableviewUI);
        var _this2 = _possibleConstructorReturn(this, (TopTableviewUI.__proto__ || Object.getPrototypeOf(TopTableviewUI)).call(this, props));
        _this2.tableData = {
            wheelState: false,
            pagerange: undefined,
            pagestartnum: 0,
            columnDefs: [],
            columnOptiontoTable: [],
            sortStates: {}
        };
        _this2.mountData = {
            flag: false
        };
        _this2.state.offsetWidth = 0;
        _this2.state.offsetHeight = 0;
        _this2.state.scrollTbodyOffsetHeight = 0;
        _this2.tableWidget = {};
        return _this2
    }
    _createClass(TopTableviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            if (this.mountData.flag)
                this.setState({
                    offsetWidth: this.getElement().offsetWidth,
                    offsetHeight: this.getElement().offsetHeight,
                    scrollTbodyOffsetHeight: this.dom.scrollTBody.offsetHeight
                })
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            if (this.mountData.flag)
                this.setState({
                    offsetWidth: this.getElement().offsetWidth,
                    offsetHeight: this.getElement().offsetHeight,
                    scrollTbodyOffsetHeight: this.dom.scrollTBody.offsetHeight
                })
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {
            this.initialLayout();
            this.tableData = {
                wheelState: false,
                pagerange: undefined,
                pagestartnum: 0,
                columnDefs: [],
                columnOptiontoTable: [],
                sortStates: {}
            };
            this.mountData = {
                flag: false
            };
            this.tableWidget = {}
        }
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this3 = this;
            _get(TopTableviewUI.prototype.__proto__ || Object.getPrototypeOf(TopTableviewUI.prototype), '__initDomRef', this).call(this);
            this.dom.scrollTBody = null;
            this.setScrollTBodyRef = function(element) {
                _this3.dom.scrollTBody = element
            }
        }
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {
            var classTest = /(table_02)|(table_03)|(table_01)|(white)|(normal)/g;
            if (!classTest.test(TopUI.Util.__classListToClassString(this.userClassList))) {
                TopUI.Util.__addClassToClassList(this.userClassList, 'table_01')
            }
        }
    }, {
        key: '__initProperties',
        value: function __initProperties() {
            if (typeof this.state.items === 'string') {
                this.tableData.data = TopUI.Util.namespace(this.state.items, this);
                this.tableData.itemsString = this.state.items
            } else if (_typeof(this.items) === 'object') {
                this.tableData.data = this.items
            } else if (this.items === undefined) {
                this.tableData.data = []
            }
            this.tableData.__headerOption = typeof this.state.headerOption === 'string' ? TopUI.Util.namespace(this.state.headerOption, this) : this.state.headerOption;
            this.tableData.__columnOption = typeof this.state.columnOption === 'string' ? TopUI.Util.namespace(this.state.columnOption, this) : this.state.columnOption;
            this.tableData.columnResize = this.__getColumnResizeValue(this.state.columnResize);
            this.tableData.horizontalScroll = this.tableData.columnResize ? true : this.state.horizontalScroll;
            this.tableData.scrollTable = this.state.scrollBodyHeight || this.tableData.horizontalScroll ? true : false;
            if (_typeof(this.state.order) === 'object') {
                this.tableData.order = JSON.parse(JSON.stringify(this.state.order))
            } else if (typeof this.state.order === 'string') {
                this.tableData.order = TopUI.Util.namespace(this.state.order, this)
            }
            if (this.tableData.data && this.tableData.data[0]) {
                this.tableData.itemKeys = Object.keys(this.tableData.data[0]);
                this.tableData.itemText = Object.keys(this.tableData.data[0])
            } else {
                this.tableData.itemKeys = [];
                this.tableData.itemText = []
            }
        }
    }, {
        key: '__getColumnResizeValue',
        value: function __getColumnResizeValue(str) {
            if (this.state.columnReorder) {
                return 'auto'
            }
            if (str === true || str === 'auto') {
                return 'auto'
            } else if (str === false) {
                return false
            } else if (str === 'fixed') {
                return 'fixed'
            }
            return 'auto'
        }
    }, {
        key: 'setPageInfo',
        value: function setPageInfo(info) {
            if (this.tableData.pageInfo === undefined) {
                this.tableData.pageInfo = {
                    page: 1,
                    length: this.state.pageLength,
                    start: 0,
                    end: this.state.pageLength - 1
                }
            }
            if ((typeof info === 'undefined' ? 'undefined' : _typeof(info)) === 'object') {
                var keys = Object.keys(info);
                for (var i = 0, len = keys.length; i < len; i++) {
                    this.tableData.pageInfo[keys[i]] = info[keys[i]]
                }
            }
        }
    }, {
        key: 'convertTableData',
        value: function convertTableData() {
            this.tableData.isIDETableview = this.state.children.length > 0 ? true : false;
            if (this.tableData.isIDETableview === true) {
                this.changeItemLayoutToData()
            }
        }
    }, {
        key: 'changeItemLayoutToData',
        value: function changeItemLayoutToData() {
            var index = 0;
            for (var i = 0; i < this.itemLayoutDom.length; i++) {
                if (this.itemLayoutDom[i].props.tagName === 'top-tableheader') {
                    for (var j = 0; j < this.itemLayoutDom[i].props.children.length; j++) {
                        if (this.itemLayoutDom[i].props.children[j].props.tagName === 'top-headerrow') {
                            if (this.tableData.__headerOption === undefined)
                                this.tableData.__headerOption = {};
                            if (this.tableData.__headerOption[j.toString()] === undefined)
                                this.tableData.__headerOption[j.toString()] = {};
                            var headerRow = this.itemLayoutDom[i].props.children[j];
                            for (var key in headerRow.props) {
                                if (key === 'children') {
                                    continue
                                }
                                this.tableData.__headerOption[j.toString()][key] = headerRow.props[key]
                            }
                            for (var k = 0; k < this.itemLayoutDom[i].props.children[j].props.children.length; k++) {
                                if (this.itemLayoutDom[i].props.children[j].props.children[k].props.tagName === 'top-headercolumn') {
                                    var headerColumn = this.itemLayoutDom[i].props.children[j].props.children[k];
                                    setHeaderOption(headerColumn, index, this, j);
                                    index++
                                }
                            }
                            index = 0
                        } else if (this.itemLayoutDom[i].props.children[j].props.tagName === 'top-headercolumn') {
                            if (this.tableData.__headerOption === undefined)
                                this.tableData.__headerOption = {
                                    '0': {}
                                };
                            var headerColumn = this.itemLayoutDom[i].props.children[j];
                            setHeaderOption(headerColumn, index, this);
                            index++
                        }
                    }
                } else if (this.itemLayoutDom[i].props.tagName === 'top-rowitem') {
                    for (var j = 0; j < this.itemLayoutDom[i].props.children.length; j++) {
                        if (this.tableData.__columnOption === undefined)
                            this.tableData.__columnOption = {};
                        var rowItem = this.itemLayoutDom[i];
                        for (var key in rowItem.props) {
                            if (key === 'children') {
                                continue
                            }
                            this.tableData.__columnOption[key] = rowItem.props[key]
                        }
                        if (this.itemLayoutDom[i].props.children[j].props.tagName === 'top-columnitem') {
                            if (this.tableData.__columnOption[i.toString()] === undefined)
                                this.tableData.__columnOption[i.toString()] = {};
                            var columnItem = this.itemLayoutDom[i].props.children[j];
                            setColumnOption(columnItem, j, this)
                        }
                    }
                }
            }
            function setHeaderOption(headerColumn, index, _this, rowNum) {
                if (!rowNum)
                    rowNum = 0;
                if (headerColumn.props.type === 'normal' || headerColumn.props.type === 'required') {
                    if (_this.tableData.__headerOption[rowNum.toString()][index.toString()] === undefined)
                        _this.tableData.__headerOption[rowNum.toString()][index.toString()] = {};
                    for (var key in headerColumn.props) {
                        _this.tableData.__headerOption[rowNum.toString()][index.toString()][key] = headerColumn.props[key]
                    }
                }
            }
            function setColumnOption(columnItem, columnNum, _this) {
                if (_this.tableData.__columnOption[columnNum.toString()] === undefined)
                    _this.tableData.__columnOption[columnNum.toString()] = {};
                for (var key in columnItem.props) {
                    if (key === 'children' && columnItem.props[key] && columnItem.props[key].length > 0) {
                        var tagName = columnItem.props[key][0].props.tagName;
                        if (tagName)
                            _this.tableData.__columnOption[columnNum.toString()].type = tagName.slice(4, tagName.length);
                        if (_this.tableData.__columnOption[columnNum.toString()].property === undefined)
                            _this.tableData.__columnOption[columnNum.toString()].property = {};
                        for (var k in columnItem.props[key][0].props) {
                            _this.tableData.__columnOption[columnNum.toString()].property[k] = columnItem.props[key][0].props[k]
                        }
                    } else if (key === 'onCreated' || key === 'onCelldblclick') {
                        if (_this.tableData.__columnOption[columnNum.toString()].event === undefined)
                            _this.tableData.__columnOption[columnNum.toString()].event = {};
                        _this.tableData.__columnOption[columnNum.toString()].event[key] = columnItem.props[key]
                    } else
                        _this.tableData.__columnOption[columnNum.toString()][key] = columnItem.props[key]
                }
            }
        }
    }, {
        key: 'setDefaultData',
        value: function setDefaultData() {
            if (!this.tableData.__headerOption)
                this.createHeaderOptionByItem();
            for (var i in this.tableData.__headerOption) {
                this.tableData.__headerOption[i] = TopUI.Util.__convertProperties(this.tableData.__headerOption[i]);
                this.tableData.__headerOption[i]['incapable'] = {
                    id: 'incapable_header',
                    class: 'incapable_header',
                    type: 'incapable',
                    visible: 'visible'
                };
                for (var j in this.tableData.__headerOption[i]) {
                    if (_typeof(this.tableData.__headerOption[i][j]) === 'object') {
                        this.tableData.__headerOption[i][j] = TopUI.Util.__convertProperties(this.tableData.__headerOption[i][j]);
                        setHeaderData(this.tableData.__headerOption[i][j], 'normal', this.tableData.itemText[parseInt(j)])
                    }
                }
            }
            if (!this.tableData.__columnOption)
                this.createColumnOptionByItem();
            this.tableData.__columnOption = TopUI.Util.__convertProperties(this.tableData.__columnOption);
            this.tableData.__columnOption['incapable'] = {
                id: 'incapable_column',
                class: 'incapable_column',
                type: 'incapable',
                visible: 'visible',
                rowspan: 9999,
                layoutWidth: ''
            };
            for (var i in this.tableData.__columnOption) {
                if (_typeof(this.tableData.__columnOption[i]) === 'object') {
                    this.tableData.__columnOption[i] = TopUI.Util.__convertProperties(this.tableData.__columnOption[i]);
                    setColumnData(this.tableData.__columnOption[i]);
                    for (var j in this.tableData.__columnOption[i]) {
                        if (_typeof(this.tableData.__columnOption[i][j]) === 'object') {
                            this.tableData.__columnOption[i][j] = TopUI.Util.__convertProperties(this.tableData.__columnOption[i][j])
                        }
                    }
                }
            }
            function setHeaderData(option, type, text) {
                option.text = option.text ? option.text : text;
                option.single = option.single ? option.single : false;
                option.colspan = option.colspan ? parseInt(option.colspan) : 1;
                option.rowspan = option.rowspan ? parseInt(option.rowspan) : 1;
                option.headerControl = option.headerControl ? option.headerControl : null;
                option.headerControlVisible = option.headerControlVisible ? option.headerControlVisible : false;
                option.checkableHead = option.checkableHead ? option.checkableHead : true;
                option.visible = option.visible === 'none' || option.visible === 'false' || option.visible === false ? 'none' : 'visible';
                option.disabled = option.disabled ? option.disabled : false;
                option.classList = ['head-cell'];
                TopUI.Util.__classStringToClassList(option.class, option.classList);
                TopUI.Util.__classStringToClassList(option.className, option.classList);
                if (type === 'normal')
                    option.layoutWidth = option.layoutWidth ? option.layoutWidth : '';
                else
                    option.layoutWidth = option.layoutWidth ? option.layoutWidth : 'match_parent'
            }
            function setColumnData(option) {
                option.visible = option.visible === 'none' || option.visible === 'false' || option.visible === false ? 'none' : 'visible';
                option.editable = option.editable ? option.editable : false;
                option.horizontalAlignment = option.horizontalAlignment ? option.horizontalAlignment : '';
                option.colspan = option.colspan ? parseInt(option.colspan) : 1;
                option.rowspan = option.rowspan ? parseInt(option.rowspan) : 1;
                option.tabindex = option.type === 'incapable' ? -1 : 0
            }
        }
    }, {
        key: 'createHeaderOptionByItem',
        value: function createHeaderOptionByItem() {
            this.tableData.__headerOption = {
                '0': {}
            };
            for (var i = 0; i < this.tableData.itemText.length; i++) {
                this.tableData.__headerOption['0'][i.toString()] = {
                    text: this.tableData.itemText[i],
                    type: 'normal'
                }
            }
        }
    }, {
        key: 'createColumnOptionByItem',
        value: function createColumnOptionByItem() {
            this.tableData.__columnOption = {};
            for (var i = 0; i < this.tableData.itemKeys.length; i++) {
                this.tableData.__columnOption[i.toString()] = {
                    text: '{' + this.tableData.itemKeys[i] + '}'
                }
            }
        }
    }, {
        key: 'virtualtable_splitdata',
        value: function virtualtable_splitdata() {
            if (this.tableData.hh === undefined) {
                if (Object.keys(this.tableData.__headerOption).length > 1) {
                    this.tableData.hh = 0;
                    for (var k in this.tableData.__headerOption) {
                        this.tableData.hh += this.tableData.__headerOption[k].layoutHeight ? Number(this.tableData.__headerOption[k].layoutHeight.split('px')[0]) || 38 : 38
                    }
                } else {
                    this.tableData.hh = this.tableData.__headerOption['0'].layoutHeight ? Number(this.tableData.__headerOption['0'].layoutHeight.split('px')[0]) || 39 : 39
                }
            }
            if (this.tableData.hh === 0) {
                this.tableData.hh = 39
            }
            if (this.tableData.ih === undefined) {
                this.tableData.ih = this.tableData.__columnOption.layoutHeight ? Number(this.tableData.__columnOption.layoutHeight.split('px')[0]) || 35 : 35
            }
            if (this.tableData.ih === 0) {
                this.tableData.ih = 35
            }
            var vheight = 500;
            if (this.state.layoutHeight == 'match_parent') {
                if (this.state.offsetHeight === 0)
                    this.mountData.flag = true;
                else
                    vheight = this.state.offsetHeight
            } else if (this.state.layoutHeight === '' || this.state.layoutHeight === undefined || this.state.layoutHeight === 'auto' || this.state.layoutHeight === 'wrap_content') {
                var plength = this.state.pageLength > 0 ? parseInt(this.state.pageLength) : this.tableData.data.length;
                vheight = this.tableData.ih * plength + this.tableData.hh + 25;
                if (this.state.paginate) {
                    vheight = vheight + 42
                }
                ;if (this.sequence) {
                    vheight = vheight + 20
                }
                ;if (plength === 0) {
                    vheight = 500
                }
            } else if (this.state.layoutHeight.includes('%')) {
                if (this.state.offsetHeight === 0)
                    this.mountData.flag = true;
                var perc = this.state.layoutHeight.split('%')[0];
                vheight = this.state.offsetHeight
            } else {
                vheight = this.state.layoutHeight.split('px')[0]
            }
            if (this.state.sequence) {
                vheight -= 20
            }
            if (this.state.paginate) {
                vheight = vheight - 42;
                this.tableData.pagestartnum = 0
            }
            this.tableData.viewport_height = vheight - this.tableData.hh;
            if (this.state.scrollBodyHeight && this.state.scrollBodyHeight.includes('px')) {
                this.tableData.viewport_height = Number(this.state.scrollBodyHeight.split('px')[0])
            }
            this.tableData.rownum = parseInt(this.tableData.viewport_height / this.tableData.ih);
            if (this.tableData.rownum * this.tableData.ih + 12 > this.tableData.viewport_height && this.tableData.rownum > 1) {
                this.tableData.rownum--
            }
            this.tableData.viewport_height = this.tableData.rownum * this.tableData.ih + this.tableData.ih - 17;
            if (this.state.pageLength > 0 && this.state.pageLength < this.tableData.rownum) {
                this.tableData.rownum = parseInt(this.state.pageLength)
            }
            if (this.tableData.rownum <= 0) {
                this.tableData.rownum = 0
            }
            ;if (typeof this.state.items === 'string') {
                this.tableData.datapointer = TopUI.Util.namespace(this.state.items, this)
            } else if (_typeof(this.state.items) === 'object') {
                this.tableData.datapointer = this.state.items
            } else {
                this.tableData.datapointer = []
            }
            this.tableData.startRowNum = 0;
            this.tableData.checkIndexInfo = [];
            for (var i = 0; i < this.tableData.datapointer.length; i++) {
                this.tableData.checkIndexInfo.push({
                    checkbool: false,
                    status: 'R',
                    selected: false,
                    checkDisabled: false,
                    open: false,
                    linkidx: i
                })
            }
            this.tableData.backupdata = this.tableData.datapointer;
            this.tableData.data = null;
            this.tableData.data = this.tableData.datapointer.slice(0, this.tableData.rownum);
            this.tableData.checkIndexpointer = this.tableData.checkIndexInfo
        }
    }, {
        key: 'makeHeaderInfo',
        value: function makeHeaderInfo() {
            this.tableData.headerOptionCount = 0;
            if (this.tableData.__indexOption) {
                this.tableData.headerOptionCount++;
                if (this.tableData.__indexOption.visible === 'visible')
                    this.tableData.indexable = true
            }
            if (this.tableData.__checkOption) {
                this.tableData.headerOptionCount++;
                if (this.tableData.__checkOption.visible === 'visible')
                    this.tableData.checkable = true
            }
            this.tableData.tableHeaderHeight = new Array(Object.keys(this.tableData.__headerOption).length);
            for (var key in this.tableData.__headerOption) {
                if (this.tableData.tableHeaderHeight.length > 1) {
                    if (this.tableData.__headerOption[key].layoutHeight)
                        this.tableData.tableHeaderHeight.push(this.tableData.__headerOption[key].layoutHeight);
                    else
                        this.tableData.tableHeaderHeight.push('')
                } else {
                    if (this.tableData.__headerOption[key][0] && this.tableData.__headerOption[key][0].layoutHeight)
                        this.tableData.tableHeaderHeight.push(this.tableData.__headerOption[key][0].layoutHeight);
                    else
                        this.tableData.tableHeaderHeight.push('')
                }
            }
            this.tableData.fixed_pivot_num = 0;
            this.tableData.headerInfoArray = [];
            var row = 0;
            var idIndex = 0;
            for (var i in this.tableData.__headerOption) {
                var col = 0;
                if (this.tableData.checkable && this.tableData.__checkOption) {
                    var headerInfo = {};
                    for (var key in this.tableData.__checkOption) {
                        headerInfo[key] = this.tableData.__checkOption[key]
                    }
                    setHeaderInfo(headerInfo, row, col, idIndex, this);
                    this.tableData.headerInfoArray.push(headerInfo);
                    this.tableData.headerCheckableIndex = idIndex;
                    col++;
                    idIndex++
                }
                if (this.tableData.indexable && this.tableData.__indexOption) {
                    var headerInfo = {};
                    for (var key in this.tableData.__indexOption) {
                        headerInfo[key] = this.tableData.__indexOption[key]
                    }
                    setHeaderInfo(headerInfo, row, col, idIndex, this);
                    this.tableData.headerInfoArray.push(headerInfo);
                    this.tableData.headerIndexableIndex = idIndex;
                    col++;
                    idIndex++
                }
                for (var j in this.tableData.__headerOption[i]) {
                    if (j === 'incapable' || _typeof(this.tableData.__headerOption[i][j]) !== 'object')
                        continue;
                    var headerInfo = {};
                    for (var key in this.tableData.__headerOption[i][j]) {
                        headerInfo[key] = this.tableData.__headerOption[i][j][key]
                    }
                    setHeaderInfo(headerInfo, row, col, idIndex, this);
                    this.tableData.headerInfoArray.push(headerInfo);
                    col++;
                    idIndex++
                }
                if (this.tableData.__headerOption[i]['incapable']) {
                    var headerInfo = {};
                    for (var key in this.tableData.__headerOption[i]['incapable']) {
                        headerInfo[key] = this.tableData.__headerOption[i]['incapable'][key]
                    }
                    setHeaderInfo(headerInfo, row, col, idIndex, this);
                    this.tableData.headerInfoArray.push(headerInfo);
                    col++;
                    idIndex++
                }
                row++
            }
            this.tableData.lastHeaderCount = 0;
            for (var i = 0; i < this.tableData.headerInfoArray.length; i++) {
                if (this.tableData.headerInfoArray[i].isLastHead === true) {
                    if (this.tableData.headerInfoArray[i].visible === 'visible')
                        this.tableData.lastHeaderCount++;
                    var headerType = this.tableData.headerInfoArray[i].type;
                    var str = headerType === 'check' || headerType === 'index' || headerType === 'index_r' ? headerType : i - this.tableData.headerOptionCount;
                    var indexString = String(this.tableData.headerInfoArray[i].headerArrayIndex - this.tableData.headerOptionCount);
                    this.tableData.headerInfoArray[i].classList.push('headIndex_' + indexString);
                    this.tableData.headerInfoArray[i].classList.push('last-head');
                    this.tableData.headerInfoArray[i].bodyMappingIndex = str
                }
            }
            function setHeaderInfo(headerInfo, row, col, idIndex, _this) {
                headerInfo.xmlRow = row;
                headerInfo.xmlCol = col;
                headerInfo.isLastHead = true;
                headerInfo.lastHeadNum = null;
                headerInfo.parent = null;
                headerInfo.children = [];
                headerInfo.countColspan = headerInfo.colSpan;
                headerInfo.index = idIndex;
                headerInfo.headerArrayIndex = idIndex;
                headerInfo.width = headerInfo.layoutWidth || '150px';
                headerInfo.id = headerInfo.id || 'header' + row + '_' + col;
                headerInfo.text = headerInfo.text || '';
                if (headerInfo.fixedColumnPivot === true)
                    _this.tableData.fixed_pivot_num = col + 1;
                return headerInfo
            }
        }
    }, {
        key: '__fixed_table_01_create',
        value: function __fixed_table_01_create() {
            return React.createElement('div', {
                className: 'fixed_frame'
            }, React.createElement('table', null, React.createElement('colgroup', {
                className: 'fixedheadcolgroup'
            }), React.createElement('thead', {
                className: 'head'
            }, React.createElement('tr', {
                className: 'head-row'
            }))), React.createElement('table', null, React.createElement('tbody', {
                className: 'body'
            })))
        }
    }, {
        key: '__makeScrollBox',
        value: function __makeScrollBox() {
            var scroll = {
                sX: this.state.layoutWidth,
                sY: this.state.layoutHeight
            };
            var scrollX = scroll.sX;
            var scrollY = scroll.sY;
            var classes = {
                sScrollId: 'TopTables_Table_' + this.state.id + '_wrapper',
                sScrollWrapper: 'top-tableview-root no-footer',
                sScroll: 'top-tableview-scroll',
                sScrollHead: 'top-tableview-scrollHead',
                sScrollHeadInner: 'top-tableview-scrollHeadInner',
                sScrollBodyBorder: 'top-tableview-scrollBody-border',
                sScrollBody: 'top-tableview-scrollBody'
            };
            var headStyle = {
                overflow: 'hidden',
                position: 'relative',
                border: 0,
                width: '100%'
            };
            var headInnerStyle = {
                boxSizing: 'border-box',
                width: '100%'
            };
            if (this.state.horizontalScroll) {
                var viewScrollX = 'auto'
            } else {
                var viewScrollX = 'hidden'
            }
            var bodyBorderStyle = _defineProperty({
                position: 'relative',
                width: '100%',
                height: 'auto',
                overflowX: viewScrollX,
                overflowY: 'hidden'
            }, 'height', this.tableData.viewport_height);
            var bodyStyle = {
                position: 'relative',
                overflowX: this.state.virtualScroll ? 'unset' : 'auto',
                overflow: this.state.virtualScroll ? 'unset' : 'auto',
                width: '100%'
            };
            return React.createElement('div', {
                id: classes.sScrollId,
                className: classes.sScrollWrapper
            }, this.__fixed_table_01_create(), this.__makeAutoPagination(true), React.createElement('div', {
                className: classes.sScroll
            }, React.createElement('div', {
                className: classes.sScrollHead,
                style: headStyle
            }, React.createElement('div', {
                className: classes.sScrollHeadInner,
                style: headInnerStyle
            }, this.__makeTableTag(true))), React.createElement('div', {
                className: classes.sScrollBodyBorder,
                style: bodyBorderStyle
            }, React.createElement('div', {
                ref: this.setScrollTBodyRef,
                className: classes.sScrollBody,
                style: bodyStyle
            }, this.__makeTableTag(false))), this.__makeVirtualscrollTag()), this.__makeAutoPagination(false))
        }
    }, {
        key: '__makeVirtualscrollTag',
        value: function __makeVirtualscrollTag() {
            var ids = {
                viframe: 'innerframe_' + this.state.id,
                viupbtn: 'upbtn_' + this.state.id,
                vibar: 'bar_' + this.state.id,
                viscroll: 'scroll_' + this.state.id,
                vidownbtn: 'downbtn_' + this.state.id
            };
            var classes = {
                viframe: 'viframe',
                viupbtn: 'viupbtn',
                vibar: 'vibar',
                viscroll: 'draggable ui-widget-content viscroll',
                vidownbtn: 'vidownbtn'
            };
            if (this.state.scrollTbodyOffsetHeight === 0) {
                this.mountData.flag = true
            }
            var index_inpage = this.tableData.startRowNum;
            if (this.tableData.backupdata.length === 0 || !this.tableData.items) {
                this.tableData.pagestartnum = 0
            }
            this.tableData.Dlegnth = 0;
            if (this.state.paginate && this.state.pageLength < this.tableData.datapointer.length) {
                index_inpage = index_inpage - this.tableData.pagestartnum;
                if (this.state.pageLength > 0) {
                    if (this.tableData.pagerange <= this.tableData.rownum) {
                        this.tableData.Dlegnth = 0
                    } else if (this.tableData.pagerange < this.state.pageLength) {
                        this.tableData.Dlegnth = this.tableData.pagerange
                    } else {
                        this.tableData.Dlegnth = this.state.pageLength
                    }
                } else {
                    this.tableData.Dlegnth = this.tableData.rownum
                }
            } else {
                this.tableData.Dlegnth = this.tableData.datapointer.length
            }
            var scrollh = 0;
            if (this.tableData.Dlegnth <= this.tableData.rownum) {
                scrollh = 0;
                this.tableData.startRowNum = this.tableData.pagestartnum;
                this.tableData.startrownum = this.tableData.startRowNum
            } else {
                if (this.state.scrollTbodyOffsetHeight > 0) {
                    scrollh = (this.state.scrollTbodyOffsetHeight - 30) / (this.tableData.Dlegnth / this.tableData.rownum);
                    if (scrollh < 6) {
                        scrollh = 6
                    }
                }
            }
            if (this.tableData.Dlegnth >= this.tableData.rownum) {
                this.tableData.Dlegnth = this.tableData.Dlegnth - this.tableData.rownum
            }
            if (scrollh === 0)
                var vis = 'hidden';
            else
                var vis = 'visible';
            var bary = (this.state.scrollTbodyOffsetHeight - 30 < 8 ? 8 : this.state.scrollTbodyOffsetHeight - 30) - scrollh;
            if (this.tableData.Dlegnth !== 0) {
                var posy = Number(Number(index_inpage / this.tableData.Dlegnth) * bary)
            }
            if (this.tableData.Dlegnth < index_inpage) {
                index_inpage = this.tableData.Dlegnth;
                posy = bary
            }
            var styles = {
                viframe: {
                    width: '15px',
                    height: this.state.scrollTbodyOffsetHeight.toString() + 'px',
                    marginTop: this.tableData.hh.toString() + 'px',
                    visibility: vis
                },
                vibar: {
                    height: (this.state.scrollTbodyOffsetHeight - 30 < 8 ? 8 : this.state.scrollTbodyOffsetHeight - 30).toString() + 'px'
                },
                viscroll: {
                    height: scrollh,
                    top: posy
                }
            };
            return React.createElement('div', {
                id: ids.viframe,
                className: classes.viframe,
                style: styles.viframe
            }, React.createElement('div', {
                id: ids.viupbtn,
                className: classes.viupbtn
            }), React.createElement('div', {
                id: ids.vibar,
                className: classes.vibar,
                style: styles.vibar
            }, React.createElement('div', {
                id: ids.viscroll,
                className: classes.viscroll,
                style: styles.viscroll
            })), React.createElement('div', {
                id: ids.vidownbtn,
                className: classes.vidownbtn
            }))
        }
    }, {
        key: '__makeAutoPagination',
        value: function __makeAutoPagination(isPrepend) {
            if (this.state.pagerLocation.startsWith('t') === isPrepend) {
                var dataLength = this.tableData.datapointer !== undefined ? this.tableData.datapointer.length : this.tableData.datapointer.length;
                var pagelength = this.state.pageLength;
                var total = pagelength === -1 ? 1 : Math.ceil(dataLength / pagelength);
                if (total === 0) {
                    total = 1
                }
                ;var editProperties = {
                    type: this.state.pagerType,
                    total: total,
                    page: 1
                };
                if (this.state.pagerMaxVisible)
                    editProperties.maxVisible = this.state.pagerMaxVisible;
                var pagination = TopUI.Widget.create('top-pagination', editProperties).reactElement;
                if (this.state.showresult) {
                    result = React.createElement('div', {
                        className: 'top-tableview-result'
                    }, React.createElement('span', {
                        className: 'number'
                    }, dataLength), React.createElement('span', null, 'Results'))
                }
                var paginationStyle = {};
                switch (this.state.pagerLocation) {
                case 'tl':
                case 'bl':
                    {
                        paginationStyle.textAlign = 'left';
                        break
                    }
                case 'tc':
                case 'bc':
                    {
                        paginationStyle.textAlign = 'center';
                        break
                    }
                case 'tr':
                case 'br':
                    {
                        paginationStyle.textAlign = 'right';
                        break
                    }
                }
                if (this.state.paginate === true)
                    return React.createElement('div', {
                        className: 'auto-pagination',
                        style: paginationStyle
                    }, result, React.createElement('div', {
                        className: 'top-tableview-pager'
                    }, pagination));
                else
                    return React.createElement('div', {
                        className: 'auto-pagination'
                    })
            }
        }
    }, {
        key: '__makeTableTag',
        value: function __makeTableTag(isHeader) {
            var tableStyle = {};
            if (isHeader)
                tableStyle.marginLeft = 0;
            return React.createElement('table', {
                className: 'top-tableview',
                cellPadding: 0,
                cellSpacing: 0,
                border: 0,
                role: 'grid',
                style: tableStyle
            }, this.__makeColgroup(isHeader), isHeader === true ? this.__makeTHeadTag() : this.__makeTBodyTag())
        }
    }, {
        key: '__makeColgroup',
        value: function __makeColgroup(isHeader) {
            var cols = [];
            var index = -1;
            for (var i = 0; i < this.tableData.headerInfoArray.length; i++) {
                if (this.tableData.headerInfoArray[i].isLastHead === true) {
                    index++;
                    if (this.tableData.headerInfoArray[i].visible === 'none') {
                        continue
                    }
                    var cName = 'hcol';
                    if (this.tableData.headerOptionCount <= index) {
                        cName += ' last-head_' + parseInt(index - this.tableData.headerOptionCount)
                    }
                    if (i < this.tableData.fixed_pivot_num) {
                        continue
                    }
                    if ((!this.tableData.headerInfoArray[i].layoutWidth || this.tableData.headerInfoArray[i].layoutWidth === 'match_parent') && this.tableData.headerInfoArray[i].type !== 'incapable') {
                        var default_width = this.state.offsetWidth / (this.tableData.lastHeaderCount - 1);
                        this.mountData.flag = true;
                        if (default_width === 0)
                            default_width = 150;
                        var colStyle = {
                            width: default_width + 'px'
                        }
                    } else {
                        var colStyle = {
                            width: this.tableData.headerInfoArray[i].layoutWidth
                        }
                    }
                    cols.push(React.createElement('col', {
                        className: cName,
                        'data-index': this.tableData.headerInfoArray[i].lastHeadNum,
                        span: 1,
                        key: index,
                        style: colStyle
                    }))
                }
            }
            return React.createElement('colgroup', {
                className: isHeader === true ? 'head_colgroup' : 'body_colgroup'
            }, cols)
        }
    }, {
        key: '__makeTHeadTag',
        value: function __makeTHeadTag() {
            var trs = [];
            var ths = [];
            var rowNum = -1;
            for (var i = 0; i < this.tableData.headerInfoArray.length; i++) {
                var currentCell = this.tableData.headerInfoArray[i];
                var headerStyle = getHeaderStyle(currentCell);
                var sortable = this.state.sortable || currentCell.sortable;
                var headerText = this.__makeheaderControlTag(currentCell) || currentCell.text || '';
                if (rowNum < currentCell.xmlRow) {
                    var trStyle = {
                        height: this.tableData.tableHeaderHeight[currentCell.xmlRow]
                    };
                    trs.push(React.createElement('tr', {
                        className: 'head-row',
                        style: trStyle,
                        key: currentCell.xmlRow
                    }, ths));
                    var offsetByColspan = 0;
                    var sumHeaderLayoutWidth = 0;
                    var sumOptionCount = 0;
                    rowNum = currentCell.xmlRow
                }
                var columnNum = currentCell.xmlCol - sumOptionCount;
                if (currentCell.type === 'check') {
                    if (currentCell.visible !== 'visible') {
                        continue
                    }
                    var disabled = currentCell.disabled;
                    if (currentCell.single === true)
                        disabled = true;
                    var chprop = {
                        visible: currentCell.checkableHead,
                        disabled: disabled,
                        checked: currentCell.checked
                    };
                    this.tableWidget.checkableHeadCheckbox = TopUI.Widget.create('top-checkbox', chprop);
                    var _cName = TopUI.Util.__classListToClassString(currentCell.classList);
                    var tableTh = React.createElement('th', {
                        id: currentCell.id,
                        className: _cName,
                        style: headerStyle,
                        key: currentCell.xmlCol,
                        rowSpan: currentCell.rowspan,
                        colSpan: currentCell.colspan,
                        headernum: i
                    }, currentCell.textposition === 'right' && this.tableWidget.checkableHeadCheckbox.reactElement, headerText, currentCell.textposition === 'left' && this.tableWidget.checkableHeadCheckbox.reactElement);
                    sumOptionCount++
                } else if (currentCell.type === 'index' || currentCell.type === 'index_r') {
                    if (currentCell.visible !== 'visible') {
                        continue
                    }
                    if (sortable)
                        TopUI.Util.__addClassToClassList(currentCell.classList, 'sorting', ['sorting_disable']);
                    else
                        TopUI.Util.__addClassToClassList(currentCell.classList, 'sorting_disable', ['sorting']);
                    var _cName = TopUI.Util.__classListToClassString(currentCell.classList);
                    var tableTh = React.createElement('th', {
                        id: currentCell.id,
                        className: _cName,
                        style: headerStyle,
                        key: currentCell.xmlCol,
                        rowSpan: currentCell.rowspan,
                        colSpan: currentCell.colspan,
                        headernum: i,
                        value: currentCell.text
                    }, headerText);
                    sumOptionCount++
                } else {
                    var headerValue = currentCell.value || currentCell.text || '';
                    if (currentCell.editable)
                        TopUI.Util.__addClassToClassList(currentCell.classList, 'editable');
                    else
                        TopUI.Util.__addClassToClassList(currentCell.classList, undefined, ['editable']);
                    if (currentCell.tooltip === false)
                        TopUI.Util.__addClassToClassList(currentCell.classList, 'non-tooltip');
                    else
                        TopUI.Util.__addClassToClassList(currentCell.classList, undefined, ['non-tooltip']);
                    if (currentCell.type === 'incapable' || !sortable || currentCell.headerControl === 'js::open' || currentCell.headerControl === 'js::check')
                        TopUI.Util.__addClassToClassList(currentCell.classList, 'sorting_disable', ['sorting']);
                    else
                        TopUI.Util.__addClassToClassList(currentCell.classList, 'sorting', ['sorting_disable']);
                    if (currentCell.type !== 'incapable' && currentCell.isLastHead === true && currentCell.headerControl !== 'js::index' && currentCell.headerControl !== 'js::check' && currentCell.headerControl !== 'js::status' && currentCell.headerControl !== 'js::open' && currentCell.headerControl !== 'selectbox' && currentCell.headerControl !== 'textfield') {
                        if (currentCell.headerFilter === true)
                            TopUI.Util.__addClassToClassList(currentCell.classList, 'headerfilter', ['headerfilter_disable']);
                        else
                            TopUI.Util.__addClassToClassList(currentCell.classList, 'headerfilter_disable', ['headerfilter'])
                    }
                    var _cName = TopUI.Util.__classListToClassString(currentCell.classList);
                    var tableTh = React.createElement('th', {
                        id: currentCell.id,
                        className: _cName,
                        style: headerStyle,
                        key: currentCell.xmlCol,
                        rowSpan: currentCell.rowspan,
                        colSpan: currentCell.colspan,
                        headernum: i,
                        value: headerValue,
                        actualdx: columnNum
                    }, currentCell.type === 'required' && React.createElement('span', {
                        className: 'header_required'
                    }, '*'), this.__makeFilterBtn(currentCell), headerText)
                }
                ths.push(tableTh);
                if (i + 1 < this.tableData.headerInfoArray.length && rowNum < this.tableData.headerInfoArray[i + 1].xmlRow) {
                    ths = []
                }
            }
            function getHeaderStyle(item) {
                var headerStyle = {};
                headerStyle.color = item.textColor;
                headerStyle.fontSize = item.textSize;
                headerStyle.backgroundColor = item.backgroundColor;
                headerStyle.backgroundImage = item.backgroundImage ? 'url(' + item.backgroundImage + ')' : '';
                headerStyle.opacity = item.opacity;
                headerStyle.textAlign = item.horizontalAlignment;
                if (item.tileMode === 'stretch')
                    headerStyle.backgroundSize = 'cover';
                else if (item.tileMode !== '')
                    headerStyle.backgroundRepeat = '';
                if (item.textStyle && item.textStyle !== '') {
                    var textStyleArray = item.textStyle.split('|');
                    for (var j = 0; j < textStyleArray.length; j++) {
                        textStyleArray[j] = textStyleArray[j].replace(/ /g, '');
                        if (textStyleArray[j] === 'bold') {
                            headerStyle.fontWeight = 'bold'
                        } else if (textStyleArray[j] === 'italic') {
                            headerStyle.fontStyle = 'italic'
                        } else if (textStyleArray[j] === 'underline') {
                            headerStyle.textDecoration = 'underline'
                        }
                    }
                }
                if (!(item.type === 'index' || item.type === 'index_r'))
                    headerStyle.textOverflow = 'clip';
                return headerStyle
            }
            return React.createElement('thead', {
                className: 'head'
            }, trs)
        }
    }, {
        key: '__makeheaderControlTag',
        value: function __makeheaderControlTag(currentCell) {
            var headerText = '';
            var disabled = currentCell.disabled;
            if (currentCell.single === true)
                disabled = true;
            if (currentCell.children && currentCell.children.length > 0) {
                headerText = currentCell.children
            }
            if (currentCell.headerControl === 'js::check') {
                if (!currentCell.children || currentCell.children.length === 0) {
                    var chprop = {
                        class: 'adv_head checkbox checkable-head head_' + currentCell.bodyMappingIndex,
                        visible: currentCell.checkableHead,
                        disabled: disabled,
                        checked: currentCell.checked
                    };
                    headerText = TopUI.Widget.create('top-checkbox', chprop).reactElement
                } else {
                    var props = {};
                    for (var key in currentCell.children[0].props) {
                        props[key] = currentCell.children[0].props[key]
                    }
                    props.class = TopUI.Util.__classListToClassString(TopUI.Util.__classStringToClassList(props.class, ['adv_head', 'checkbox', 'checkable-head', 'head_' + currentCell.bodyMappingIndex]));
                    props.visible = currentCell.checkableHead;
                    props.disabled = disabled;
                    props.checked = currentCell.checked;
                    headerText = TopUI.Widget.create('top-checkbox', props).reactElement
                }
            } else if (TopUI.Util.__isTopWidget('top-' + currentCell.headerControl)) {
                if (currentCell.children && currentCell.children.length > 0) {
                    var props = {};
                    for (var key in currentCell.children[0].props) {
                        props[key] = currentCell.children[0].props[key]
                    }
                    props.class = TopUI.Util.__classListToClassString(TopUI.Util.__classStringToClassList(props.class, ['adv_head', 'checkBox', 'head_' + currentCell.bodyMappingIndex]));
                    headerText = TopUI.Widget.create('top-' + currentCell.headerControl, props).reactElement
                }
            }
            return headerText
        }
    }, {
        key: '__makeFilterBtn',
        value: function __makeFilterBtn(currentCell) {
            if (currentCell.type !== 'incapable' && currentCell.isLastHead === true && currentCell.headerControl !== 'js::index' && currentCell.headerControl !== 'js::check' && currentCell.headerControl !== 'js::status' && currentCell.headerControl !== 'js::open' && currentCell.headerControl !== 'selectbox' && currentCell.headerControl !== 'textfield') {
                return TopUI.Widget.create('top-button', {
                    id: currentCell.id + '-button',
                    class: 'headerfilter-common',
                    icon: 'icon-filter',
                    float: 'right'
                }).reactElement
            }
        }
    }, {
        key: '__makeTBodyTag',
        value: function __makeTBodyTag() {
            var trs = [];
            if (this.tableData.data.length > 0) {
                for (var i = 0; i < this.tableData.data.length; i++) {
                    var tds = [];
                    var trClassList = [];
                    trClassList.push('body-row');
                    trClassList.push('row_' + i);
                    if (i % 2 === 0) {
                        trClassList.push('odd')
                    } else {
                        trClassList.push('even')
                    }
                    if (this.tableData.checkable) {
                        var checkProp = {
                            class: 'checkable-body',
                            checked: this.tableData.__checkOption.checked
                        };
                        var tdStyle = {
                            textOverflow: 'clip'
                        };
                        this.tableData.checkIndexInfo[i].checkbool = this.tableData.__checkOption.checked;
                        var checkableCheckbox = TopUI.Widget.create('top-checkbox', checkProp).reactElement;
                        var td = React.createElement('td', {
                            className: 'checkable body-cell',
                            key: 'check',
                            style: tdStyle
                        }, checkableCheckbox);
                        tds.push(td)
                    }
                    if (this.tableData.indexable) {
                        if (this.tableData.__indexOption.reverse) {
                            var index = this.tableData.backupdata.length - (this.tableData.startRowNum + i)
                        } else {
                            var index = this.tableData.startRowNum + i + 1
                        }
                        var td = React.createElement('td', {
                            className: 'indexable body-cell',
                            col: 'index',
                            key: 'index'
                        }, index.toString());
                        tds.push(td)
                    }
                    for (var key in this.tableData.__columnOption) {
                        if (_typeof(this.tableData.__columnOption[key]) === 'object') {
                            var currentColumn = this.tableData.__columnOption[key];
                            if (currentColumn.visible === 'none')
                                continue;
                            var tdClassList = [];
                            tdClassList.push('body-cell');
                            if (this.state.editable || currentColumn.editable === true)
                                tdClassList.push('editable');
                            tdClassList.push('column_' + key);
                            if (currentColumn.class)
                                tdClassList.push(currentColumn.class);
                            var tdStyle = {
                                textAlign: currentColumn.horizontalAlignment,
                                colSpan: currentColumn.colspan,
                                rowSpan: currentColumn.rowspan
                            };
                            var cellText = '';
                            if (TopUI.Util.__isTopWidget('top-' + currentColumn.type)) {
                                if (currentColumn.property.checked === 'js::check') {
                                    currentColumn.property.checked = this.tableData.checkIndexpointer[i + this.tableData.startRowNum]['checkbool'];
                                    currentColumn.property.onClick = function(event, widget) {}
                                }
                                cellText = replaceBindingProp('top-' + currentColumn.type, currentColumn.property, this.tableData.data[i], i, key);
                                tdStyle.textOverflow = 'clip'
                            } else {
                                cellText = currentColumn.text || currentColumn.value;
                                if (cellText && cellText.startsWith('js::')) {
                                    var dld = cellText.split('::')[1];
                                    if (dld === 'status') {
                                        cellText = this.tableData.checkIndexpointer[i + this.tableData.startRowNum]['status']
                                    } else if (dld === 'index') {
                                        cellText = this.tableData.checkIndexpointer[i + this.tableData.startRowNum]['linkidx'].toString()
                                    }
                                }
                                var dataFieldRegExp = new RegExp('{[\\w.]+}','g');
                                var matches = [];
                                if (typeof cellText === 'string')
                                    matches = cellText.match(dataFieldRegExp);
                                if (matches && matches.length === 1) {
                                    var fieldName = matches[0].substring(1, matches[0].length - 1);
                                    cellText = this.tableData.data[i][fieldName].toString()
                                }
                            }
                            var td = React.createElement('td', {
                                id: currentColumn.id,
                                className: TopUI.Util.__classListToClassString(tdClassList),
                                col: key,
                                tabIndex: currentColumn.tabindex,
                                key: key,
                                style: tdStyle
                            }, cellText);
                            tds.push(td)
                        }
                    }
                    var tr = React.createElement('tr', {
                        className: TopUI.Util.__classListToClassString(trClassList),
                        key: i
                    }, tds);
                    trs.push(tr)
                }
            }
            function replaceBindingProp(tagName, properties, data, rowIndex, colIndex) {
                var dataFieldRegExp = new RegExp('{[\\w.]+}','g');
                var matches = [];
                var newProps = {};
                if (!properties.id)
                    newProps.id = TopUI.Util.guid() + '_' + rowIndex + '_' + colIndex;
                else
                    newProps.id = properties.id + '_' + rowIndex + '_' + colIndex;
                for (var key in properties) {
                    if (key === 'children') {
                        var value = [];
                        var newChilds = [];
                        for (var i = 0; i < properties[key].length; i++) {
                            value.push(replaceBindingProp(properties[key][i].props.tagName, properties[key][i].props, data, rowIndex, colIndex));
                            newChilds.push(replaceBindingProp(properties[key][i].props.tagName, properties[key][i].props, data, rowIndex, colIndex))
                        }
                    } else if (key === 'id') {
                        continue
                    } else {
                        if (typeof properties[key] === 'string')
                            matches = properties[key].match(dataFieldRegExp);
                        if (matches && matches.length === 1) {
                            newProps.class = TopUI.Util.__classListToClassString(TopUI.Util.__addClassToClassList(TopUI.Util.__classStringToClassList(newProps.class), 'editable-cell'));
                            var fieldName = matches[0].substring(1, matches[0].length - 1);
                            var value = data[fieldName]
                        } else {
                            var value = properties[key]
                        }
                    }
                    newProps[key] = value
                }
                return TopUI.Widget.create(tagName, newProps, newChilds).reactElement
            }
            return React.createElement('tbody', {
                className: 'body'
            }, trs)
        }
    }, {
        key: '__makeSequenceBox',
        value: function __makeSequenceBox() {
            if (this.state.sequence) {
                var str = '[ 0/' + this.tableData.backupdata.length + ' ]';
                return React.createElement('div', {
                    className: 'seqbox'
                }, str)
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            this.__initProperties();
            this.setPageInfo();
            this.convertTableData();
            this.setDefaultData();
            this.makeHeaderInfo();
            this.virtualtable_splitdata();
            return React.createElement('top-tableview', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-tableview-root',
                name: this.state.name,
                style: this.topStyle
            }, this.__makeScrollBox(), this.__makeSequenceBox()))
        }
    }, {
        key: 'updateTableHeaders',
        value: function updateTableHeaders(headers) {
            var changedchilds = [];
            for (var i = 0; i < this.state.children.length; i++) {
                if (this.state.children[i].props.tagName === 'top-tableheader') {
                    changedchilds.push(headers)
                } else {
                    changedchilds.push(this.state.children[i])
                }
            }
            this.setState({
                children: changedchilds
            })
        }
    }, {
        key: 'updateRowItems',
        value: function updateRowItems(items) {
            var changedchilds = [];
            for (var i = 0; i < this.state.children.length; i++) {
                if (this.state.children[i].props.tagName === 'top-rowitem') {
                    changedchilds.push(items)
                } else {
                    changedchilds.push(this.state.children[i])
                }
            }
            this.setState({
                children: changedchilds
            })
        }
    }, {
        key: 'updateTableHeadersDom',
        value: function updateTableHeadersDom(headersDom) {
            var changedchilds = [];
            if (headersDom.length) {
                for (var i = 0; i < headersDom.length; i++) {
                    changedchilds.push(this.initializeHtmlObjects(headersDom[i]))
                }
            } else {
                changedchilds.push(this.initializeHtmlObjects(headersDom))
            }
            for (var i = 0; i < this.state.children.length; i++) {
                if (this.state.children[i].props.tagName === 'top-tableheader') {} else {
                    changedchilds.push(this.state.children[i])
                }
            }
            this.setState({
                children: changedchilds
            })
        }
    }, {
        key: 'updateRowItemsDom',
        value: function updateRowItemsDom(itemsDom) {
            var changedchilds = [];
            if (itemsDom.length) {
                for (var i = 0; i < itemsDom.length; i++) {
                    changedchilds.push(this.initializeHtmlObjects(itemsDom[i]))
                }
            } else {
                changedchilds.push(this.initializeHtmlObjects(itemsDom))
            }
            for (var i = 0; i < this.state.children.length; i++) {
                if (this.state.children[i].props.tagName === 'top-rowitem') {} else {
                    changedchilds.push(this.state.children[i])
                }
            }
            this.setState({
                children: changedchilds
            })
        }
    }, {
        key: 'updateTableHeadersDomString',
        value: function updateTableHeadersDomString(headersString) {
            var changedchilds = [];
            var wrapper = document.createElement('div');
            wrapper.innerHTML = headersString;
            for (var i = 0; i < wrapper.children.length; i++) {
                changedchilds.push(this.initializeHtmlObjects(wrapper.children[i]))
            }
            for (var i = 0; i < this.state.children.length; i++) {
                if (this.state.children[i].props.tagName === 'top-tableheader') {} else {
                    changedchilds.push(this.state.children[i])
                }
            }
            this.setState({
                children: changedchilds
            })
        }
    }, {
        key: 'updateRowItemsDomString',
        value: function updateRowItemsDomString(itemsString) {
            var changedchilds = [];
            var wrapper = document.createElement('div');
            wrapper.innerHTML = itemsString;
            for (var i = 0; i < wrapper.children.length; i++) {
                changedchilds.push(this.initializeHtmlObjects(wrapper.children[i]))
            }
            for (var i = 0; i < this.state.children.length; i++) {
                if (this.state.children[i].props.tagName === 'top-rowitem') {} else {
                    changedchilds.push(this.state.children[i])
                }
            }
            this.setState({
                children: changedchilds
            })
        }
    }, {
        key: 'updateHeaderColumn',
        value: function updateHeaderColumn(rowIndex, colIndex, properties, childs) {
            var changedchilds = [];
            var row = 0;
            for (var i = 0; i < this.state.children.length; i++) {
                if (this.state.children[i].props.tagName === 'top-tableheader') {
                    if (row === rowIndex) {
                        var foundHeader = this.state.children[i];
                        for (var j = 0; j < foundHeader.props.children.length; j++) {
                            if (j === colIndex) {
                                if (typeof childs === 'string') {
                                    var wrapper = document.createElement('div');
                                    wrapper.innerHTML = childs;
                                    childs = [];
                                    for (var k = 0; k < wrapper.children.length; k++) {
                                        childs.push(this.initializeHtmlObjects(wrapper.children[k]))
                                    }
                                } else if ((typeof childs === 'undefined' ? 'undefined' : _typeof(childs)) === 'object') {
                                    var childsList = [];
                                    if (childs.length) {
                                        for (var k = 0; k < childs.length; k++) {
                                            if (childs[k]instanceof HTMLElement) {
                                                childsList.push(this.initializeHtmlObjects(childs[k]))
                                            } else if (childs[k]instanceof TopUI.Widget) {
                                                childsList.push(childs[k].reactElement)
                                            } else {
                                                childsList.push(childs[k])
                                            }
                                        }
                                    } else {
                                        if (childs instanceof HTMLElement) {
                                            childsList.push(this.initializeHtmlObjects(childs))
                                        } else if (childs instanceof TopUI.Widget) {
                                            childsList.push(childs.reactElement)
                                        } else {
                                            childsList.push(childs)
                                        }
                                    }
                                    childs = childsList
                                }
                                foundHeader.props.children[j] = React.cloneElement(foundHeader.props.children[j], properties, childs)
                            }
                        }
                        changedchilds.push(foundHeader)
                    } else {
                        changedchilds.push(this.state.children[i])
                    }
                    row++
                } else {
                    changedchilds.push(this.state.children[i])
                }
            }
            this.setState({
                children: changedchilds
            })
        }
    }, {
        key: 'updateColumnItem',
        value: function updateColumnItem(rowIndex, colIndex, properties, childs) {
            var changedchilds = [];
            var row = 0;
            for (var i = 0; i < this.state.children.length; i++) {
                if (this.state.children[i].props.tagName === 'top-rowitem') {
                    if (row === rowIndex) {
                        var foundRowItem = this.state.children[i];
                        for (var j = 0; j < foundRowItem.props.children.length; j++) {
                            if (j === colIndex) {
                                if (typeof childs === 'string') {
                                    var wrapper = document.createElement('div');
                                    wrapper.innerHTML = childs;
                                    childs = [];
                                    for (var k = 0; k < wrapper.children.length; k++) {
                                        childs.push(this.initializeHtmlObjects(wrapper.children[k]))
                                    }
                                } else if ((typeof childs === 'undefined' ? 'undefined' : _typeof(childs)) === 'object') {
                                    var childsList = [];
                                    if (childs.length) {
                                        for (var k = 0; k < childs.length; k++) {
                                            if (childs[k]instanceof HTMLElement) {
                                                childsList.push(this.initializeHtmlObjects(childs[k]))
                                            } else if (childs[k]instanceof TopUI.Widget) {
                                                childsList.push(childs[k].reactElement)
                                            } else {
                                                childsList.push(childs[k])
                                            }
                                        }
                                    } else {
                                        if (childs instanceof HTMLElement) {
                                            childsList.push(this.initializeHtmlObjects(childs))
                                        } else if (childs instanceof TopUI.Widget) {
                                            childsList.push(childs.reactElement)
                                        } else {
                                            childsList.push(childs)
                                        }
                                    }
                                    childs = childsList
                                }
                                foundRowItem.props.children[j] = React.cloneElement(foundRowItem.props.children[j], properties, childs)
                            }
                        }
                        changedchilds.push(foundRowItem)
                    } else {
                        changedchilds.push(this.state.children[i])
                    }
                    row++
                } else {
                    changedchilds.push(this.state.children[i])
                }
            }
            this.setState({
                children: changedchilds
            })
        }
    }]);
    return TopTableviewUI
}(TopContainerBehavior);
TopTableviewUI.propConfigs = Object.assign({}, TopContainerBehavior.propConfigs, {});
TopTableviewUI.defaultProps = Object.assign({}, TopContainerBehavior.defaultProps, {
    tagName: 'top-tableview',
    layoutVerticalAlignment: 'top',
    verticalScroll: true,
    horizontalScroll: false,
    paginate: false,
    pageLength: -1,
    lengthMenu: [{
        text: '10',
        value: 10
    }, {
        text: '25',
        value: 25
    }, {
        text: '50',
        value: 50
    }, {
        text: 'ALL',
        value: 'ALL'
    }],
    lengthChange: false,
    pagerType: 'basic',
    pagerMaxVisible: 20,
    pagerLocation: 'bc',
    showresult: true,
    sortable: true,
    editable: false,
    order: [],
    checkable: false,
    checked: false,
    columnReorder: false,
    columnResize: false,
    readonly: true,
    emptyMessage: 'No data available in table',
    selectedIndex: -1,
    selectType: 'row',
    virtualScroll: true,
    headerContextMenu: false,
    multiSortable: false,
    treeDraggable: false,
    indexable: false,
    storeColumn: false,
    sequence: false
});
TopUI.Widget.Container.Tableview = function() {
    Tableview.prototype = Object.create(TopUI.Widget.Container.prototype);
    Tableview.prototype.constructor = Tableview;
    function Tableview(element, props) {
        if (element instanceof TopTableviewUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopTableviewUI, props)
        }
    }
    Tableview.create = function(element, props) {
        return new Tableview(element,props)
    }
    ;
    Tableview.prototype.updateTableHeaders = function(childs) {
        this.template.updateTableHeaders(childs)
    }
    ;
    Tableview.prototype.updateRowItems = function(childs) {
        this.template.updateRowItems(childs)
    }
    ;
    Tableview.prototype.updateTableHeadersDom = function(node) {
        this.template.updateTableHeadersDom(node)
    }
    ;
    Tableview.prototype.updateRowItemsDom = function(node) {
        this.template.updateRowItemsDom(node)
    }
    ;
    Tableview.prototype.updateTableHeadersDomString = function(string) {
        this.template.updateTableHeadersDomString(string)
    }
    ;
    Tableview.prototype.updateRowItemsDomString = function(string) {
        this.template.updateRowItemsDomString(string)
    }
    ;
    Tableview.prototype.updateHeaderColumn = function(rowIndex, colIndex, props, childs) {
        this.template.updateHeaderColumn(rowIndex, colIndex, props, childs)
    }
    ;
    Tableview.prototype.updateColumnItem = function(rowIndex, colIndex, props, childs) {
        this.template.updateColumnItem(rowIndex, colIndex, props, childs)
    }
    ;
    return Tableview
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopTextareaUI = function(_TopTextBehavior) {
    _inherits(TopTextareaUI, _TopTextBehavior);
    function TopTextareaUI(props) {
        _classCallCheck(this, TopTextareaUI);
        return _possibleConstructorReturn(this, (TopTextareaUI.__proto__ || Object.getPrototypeOf(TopTextareaUI)).call(this, props))
    }
    _createClass(TopTextareaUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            var topRootClass = 'top-textarea-root';
            var topDisabled = this.__calculateDerivedDisabled();
            return React.createElement('top-textarea', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('textarea', {
                id: this.state.id,
                ref: this.setRootRef,
                className: topRootClass,
                spellCheck: 'false',
                disabled: topDisabled,
                rows: this.state.rows,
                cols: this.state.cols,
                placeholder: this.state.hint,
                value: this.state.text,
                style: this.topStyle
            }))
        }
    }]);
    return TopTextareaUI
}(TopTextBehavior);
TopTextareaUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {});
TopTextareaUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
    tagName: 'top-textarea',
    rows: 5,
    cols: 100
});
TopUI.Widget.Textarea = function() {
    Textarea.prototype = Object.create(TopUI.Widget.prototype);
    Textarea.prototype.constructor = Textarea;
    function Textarea(element, props) {
        if (element instanceof TopTextareaUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopTextareaUI, props)
        }
    }
    Textarea.create = function(element, props) {
        return new Textarea(element,props)
    }
    ;
    return Textarea
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined
        } else {
            return get(parent, property, receiver)
        }
    } else if ('value'in desc) {
        return desc.value
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined
        }
        return getter.call(receiver)
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopTextfieldUI = function(_TopTextBehavior) {
    _inherits(TopTextfieldUI, _TopTextBehavior);
    function TopTextfieldUI(props) {
        _classCallCheck(this, TopTextfieldUI);
        return _possibleConstructorReturn(this, (TopTextfieldUI.__proto__ || Object.getPrototypeOf(TopTextfieldUI)).call(this, props))
    }
    _createClass(TopTextfieldUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {
            this.__setTitleLineHeight();
            this.__setWrapperWidth();
            this.__setInputWidth()
        }
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {
            this.__setTitleLineHeight();
            this.__setWrapperWidth();
            this.__setInputWidth()
        }
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__initDomRef',
        value: function __initDomRef() {
            var _this2 = this;
            _get(TopTextfieldUI.prototype.__proto__ || Object.getPrototypeOf(TopTextfieldUI.prototype), '__initDomRef', this).call(this);
            this.dom.title = null;
            this.dom.text = null;
            this.dom.clear = null;
            this.dom.icon = null;
            this.dom.wrapper2 = null;
            this.setTitleRef = function(element) {
                _this2.dom.title = element
            }
            ;
            this.setTextRef = function(element) {
                _this2.dom.text = element
            }
            ;
            this.setClearRef = function(element) {
                _this2.dom.clear = element
            }
            ;
            this.setIconRef = function(element) {
                _this2.dom.icon = element
            }
            ;
            this.setWrapper2Ref = function(element) {
                _this2.dom.wrapper2 = element
            }
        }
    }, {
        key: '__initialClassname',
        value: function __initialClassname() {
            var classTest = /(in_textfield)|(out_textfield)/g;
            if (!classTest.test(TopUI.Util.__classListToClassString(this.userClassList))) {
                TopUI.Util.__addClassToClassList(this.userClassList, 'in_textfield')
            }
        }
    }, {
        key: '__setTitleLineHeight',
        value: function __setTitleLineHeight() {
            var label = this.dom.title;
            if (label) {
                label.style.lineHeight = label.offsetHeight + 'px'
            }
        }
    }, {
        key: '__setWrapperWidth',
        value: function __setWrapperWidth() {
            var label = this.dom.title;
            if (label) {
                var titleWidth = label.offsetWidth;
                this.dom.wrapper2.style.width = 'calc(100% - ' + titleWidth + 'px)'
            }
        }
    }, {
        key: '__setInputWidth',
        value: function __setInputWidth() {
            var span = this.dom.icon;
            var button = this.dom.clear;
            var sWidth = 0;
            if (span) {
                sWidth += span.offsetWidth
            }
            if (button) {
                sWidth += button.offsetWidth
            }
            if (span || button) {
                this.dom.text.style.width = 'calc(100% - ' + sWidth + 'px)'
            } else {
                this.dom.text.style.width = ''
            }
        }
    }, {
        key: 'handleClear',
        value: function handleClear(e) {
            this.setState({
                text: ''
            })
        }
    }, {
        key: '__render',
        value: function __render() {
            var topRootClass = 'top-textfield-root';
            var topTextClass = 'top-textfield-text';
            var topIconClass = 'top-textfield-icon';
            var topIconStyle = {};
            var topTitleClass = 'top-textfield-title';
            var topClearStyle = {};
            var topDisabled = this.__calculateDerivedDisabled();
            if (this.state.icon) {
                topIconClass += ' top-textfield-icon ' + this.state.icon;
                topIconStyle['width'] = this.state.textSize
            }
            if (this.state.clear) {
                topClearStyle['width'] = this.state.textSize
            }
            return React.createElement('top-textfield', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: topRootClass,
                style: this.topStyle
            }, React.createElement('form', {
                autoComplete: 'off',
                onSubmit: function onSubmit(e) {
                    e.preventDefault()
                }
            }, React.createElement('div', {
                className: 'top-textfield-wrapper-depth-1'
            }, this.state.title && React.createElement('label', {
                ref: this.setTitleRef,
                className: topTitleClass,
                disabled: topDisabled
            }, this.state.title), React.createElement('div', {
                ref: this.setWrapper2Ref,
                className: 'top-textfield-wrapper-depth-2'
            }, React.createElement('input', {
                ref: this.setTextRef,
                className: topTextClass,
                type: this.state.password ? 'password' : 'text',
                disabled: topDisabled,
                placeholder: this.state.hint,
                value: this.state.text
            }), this.state.clear && React.createElement('button', {
                ref: this.setClearRef,
                className: 'top-textfield-clear',
                type: 'reset',
                style: topClearStyle
            }), this.state.icon && React.createElement('span', {
                ref: this.setIconRef,
                className: topIconClass,
                disabled: topDisabled,
                style: topIconStyle
            }))))))
        }
    }]);
    return TopTextfieldUI
}(TopTextBehavior);
TopTextfieldUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {});
TopTextfieldUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
    tagName: 'top-textfield'
});
TopUI.Widget.Textfield = function() {
    Textfield.prototype = Object.create(TopUI.Widget.prototype);
    Textfield.prototype.constructor = Textfield;
    function Textfield(element, props) {
        if (element instanceof TopTextfieldUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopTextfieldUI, props)
        }
    }
    Textfield.create = function(element, props) {
        return new Textfield(element,props)
    }
    ;
    return Textfield
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopTextviewUI = function(_TopTextBehavior) {
    _inherits(TopTextviewUI, _TopTextBehavior);
    function TopTextviewUI(props) {
        _classCallCheck(this, TopTextviewUI);
        var _this = _possibleConstructorReturn(this, (TopTextviewUI.__proto__ || Object.getPrototypeOf(TopTextviewUI)).call(this, props));
        _this.__updateUrl();
        return _this
    }
    _createClass(TopTextviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__updateUrl',
        value: function __updateUrl() {
            if (this.state.url) {
                this.state.url = this.state.url.startsWith('/') ? 'javascript:TopUI.App.routeTo("' + this.state.url + '")' : this.state.url
            }
        }
    }, {
        key: '__render',
        value: function __render() {
            var topRootClass = 'top-textview-root';
            var topUrlClass = 'top-textview-url';
            if (this.state.multiLine) {
                topRootClass += ' multi-line';
                topUrlClass += ' multi-line'
            }
            return React.createElement('top-textview', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('span', {
                id: this.state.id,
                ref: this.setRootRef,
                className: topRootClass,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('a', {
                className: topUrlClass,
                href: this.state.url
            }, this.state.text), React.createElement('div', {
                className: 'top-textview-aligner'
            })))
        }
    }]);
    return TopTextviewUI
}(TopTextBehavior);
TopTextviewUI.propConfigs = Object.assign({}, TopTextBehavior.propConfigs, {});
TopTextviewUI.defaultProps = Object.assign({}, TopTextBehavior.defaultProps, {
    tagName: 'top-textview',
    ellipsis: false,
    multiLine: false
});
TopUI.Widget.Textview = function() {
    Textview.prototype = Object.create(TopUI.Widget.prototype);
    Textview.prototype.constructor = Textview;
    function Textview(element, props) {
        if (element instanceof TopTextviewUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopTextviewUI, props)
        }
    }
    Textview.create = function(element, props) {
        return new Textview(element,props)
    }
    ;
    return Textview
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopToggleUI = function(_TopCheckBehavior) {
    _inherits(TopToggleUI, _TopCheckBehavior);
    function TopToggleUI(props) {
        _classCallCheck(this, TopToggleUI);
        return _possibleConstructorReturn(this, (TopToggleUI.__proto__ || Object.getPrototypeOf(TopToggleUI)).call(this, props))
    }
    _createClass(TopToggleUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            var topDisabled = this.__calculateDerivedDisabled();
            var id = this.state.id + this._reactInternalFiber.key;
            var topRootClassList = [];
            topRootClassList.push('top-toggle-root');
            topRootClassList.push('btn');
            if (this.state.checked) {
                topRootClassList.push('btn-primary')
            } else {
                topRootClassList.push('btn-default');
                topRootClassList.push('off')
            }
            var topRootClass = TopUI.Util.__classListToClassString(topRootClassList);
            return React.createElement('top-toggle', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                disabled: topDisabled,
                style: this.topTagStyle
            }, React.createElement('label', {
                id: this.state.id,
                ref: this.setRootRef,
                className: topRootClass,
                htmlFor: id,
                style: this.topStyle
            }, React.createElement('input', {
                id: id,
                type: 'checkbox',
                name: this.state.groupId,
                checked: this.state.checked,
                disabled: topDisabled
            }), React.createElement('div', {
                className: 'top-toggle-background'
            }, React.createElement('span', {
                className: 'top-toggle-handle btn'
            }))))
        }
    }]);
    return TopToggleUI
}(TopCheckBehavior);
TopToggleUI.propConfigs = Object.assign({}, TopCheckBehavior.propConfigs, {});
TopToggleUI.defaultProps = Object.assign({}, TopCheckBehavior.defaultProps, {
    tagName: 'top-toggle'
});
TopUI.Widget.Toggle = function() {
    Toggle.prototype = Object.create(TopUI.Widget.prototype);
    Toggle.prototype.constructor = Toggle;
    function Toggle(element, props) {
        if (element instanceof TopToggleUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopToggleUI, props)
        }
    }
    Toggle.create = function(element, props) {
        return new Toggle(element,props)
    }
    ;
    return Toggle
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopTreeviewUI = function(_TopContainerBehavior) {
    _inherits(TopTreeviewUI, _TopContainerBehavior);
    function TopTreeviewUI(props) {
        _classCallCheck(this, TopTreeviewUI);
        var _this = _possibleConstructorReturn(this, (TopTreeviewUI.__proto__ || Object.getPrototypeOf(TopTreeviewUI)).call(this, props));
        _this.dataIndex = 0;
        return _this
    }
    _createClass(TopTreeviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__renderItem',
        value: function __renderItem(data, index, level) {
            var dataIndex = this.dataIndex++;
            var checkboxId = this.state.id + '_check_' + dataIndex;
            var spanClass;
            var spanStyle = {};
            if (data.image) {
                spanClass = 'top-treeview-image';
                spanStyle['background'] = 'url(' + data.image + ')'
            } else {
                spanClass = 'top-treeview-icon ' + (data.icon ? data.icon : 'icon-file')
            }
            return React.createElement(React.Fragment, null, React.createElement('input', {
                type: 'checkbox',
                className: 'top-treeview-button'
            }), React.createElement('i', null), React.createElement('input', {
                type: 'checkbox',
                id: checkboxId,
                className: 'top-treeview-check'
            }), React.createElement('label', {
                htmlFor: checkboxId
            }), data.children && data.children.length > 0 ? [React.createElement('label', {
                id: data.id,
                className: 'top-treeview-item',
                'data-index': dataIndex
            }, React.createElement('span', {
                className: spanClass,
                style: spanStyle
            }), React.createElement('span', {
                className: 'top-treeview-edit_btn',
                style: {
                    visibility: 'hidden'
                }
            }), data.text), React.createElement('ul', {
                className: 'top-treeview-children_nav',
                style: {
                    display: 'block'
                }
            }, this.__renderList(data.children, level))] : React.createElement('a', {
                id: data.id,
                className: 'top-treeview-item',
                'data-index': dataIndex
            }, React.createElement('span', {
                className: spanClass,
                style: spanStyle
            }), React.createElement('span', {
                className: 'top-treeview-edit_btn',
                style: {
                    visibility: 'hidden'
                }
            }), data.text))
        }
    }, {
        key: '__renderList',
        value: function __renderList(_data, level) {
            var _this2 = this;
            return _data.map(function(data, index) {
                var listId = 'list_' + index;
                var listClass = 'top-treeview-list level' + level + ' ' + (data.children ? 'parent' : 'child');
                return React.createElement('li', {
                    key: _this2.state.id + '_list_' + index,
                    id: listId,
                    className: listClass
                }, _this2.__renderItem(data, index, level + 1))
            })
        }
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-treeview', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('div', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-treeview-root',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }, React.createElement('ul', {
                className: 'top-treeview-container'
            }, this.__renderList(this.state.items, 0))))
        }
    }]);
    return TopTreeviewUI
}(TopContainerBehavior);
TopTreeviewUI.propConfigs = Object.assign({}, TopContainerBehavior.propConfigs, {
    items: {
        type: Array,
        aliases: ['nodes']
    }
});
TopTreeviewUI.defaultProps = Object.assign({}, TopContainerBehavior.defaultProps, {
    tagName: 'top-treeview'
});
TopUI.Widget.Container.Treeview = function() {
    Treeview.prototype = Object.create(TopUI.Widget.Container.prototype);
    Treeview.prototype.constructor = Treeview;
    function Treeview(element, props) {
        if (element instanceof TopTreeviewUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopTreeviewUI, props)
        }
    }
    Treeview.create = function(element, props) {
        return new Treeview(element,props)
    }
    ;
    return Treeview
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopVideoviewUI = function(_TopCommonstyleBehavi) {
    _inherits(TopVideoviewUI, _TopCommonstyleBehavi);
    function TopVideoviewUI(props) {
        _classCallCheck(this, TopVideoviewUI);
        return _possibleConstructorReturn(this, (TopVideoviewUI.__proto__ || Object.getPrototypeOf(TopVideoviewUI)).call(this, props))
    }
    _createClass(TopVideoviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-videoview', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('video', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-videoview-root',
                type: 'video/mp4',
                src: this.state.src,
                name: this.state.name,
                autoPlay: this.state.autoPlay,
                controls: this.state.control,
                loop: this.state.loop,
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }))
        }
    }]);
    return TopVideoviewUI
}(TopCommonstyleBehavior);
TopVideoviewUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {});
TopVideoviewUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: 'top-videoview'
});
TopUI.Widget.Videoview = function() {
    Videoview.prototype = Object.create(TopUI.Widget.prototype);
    Videoview.prototype.constructor = Videoview;
    function Videoview(element, props) {
        if (element instanceof TopVideoviewUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopVideoviewUI, props)
        }
    }
    Videoview.create = function(element, props) {
        return new Videoview(element,props)
    }
    ;
    return Videoview
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopWebviewUI = function(_TopCommonstyleBehavi) {
    _inherits(TopWebviewUI, _TopCommonstyleBehavi);
    function TopWebviewUI(props) {
        _classCallCheck(this, TopWebviewUI);
        return _possibleConstructorReturn(this, (TopWebviewUI.__proto__ || Object.getPrototypeOf(TopWebviewUI)).call(this, props))
    }
    _createClass(TopWebviewUI, [{
        key: '__componentDidMount',
        value: function __componentDidMount() {}
    }, {
        key: '__componentDidUpdate',
        value: function __componentDidUpdate() {}
    }, {
        key: '__componentWillUpdate',
        value: function __componentWillUpdate() {}
    }, {
        key: '__componentWillUnmount',
        value: function __componentWillUnmount() {}
    }, {
        key: '__render',
        value: function __render() {
            return React.createElement('top-webview', {
                id: this.state.id,
                ref: this.setTopRef,
                'class': this.makeTopTagClassString(),
                style: this.topTagStyle
            }, React.createElement('iframe', {
                id: this.state.id,
                ref: this.setRootRef,
                className: 'top-webview-root',
                src: this.state.url,
                name: this.state.name,
                alt: this.state.name,
                scrolling: 'yes',
                disabled: this.__calculateDerivedDisabled(),
                style: this.topStyle
            }))
        }
    }]);
    return TopWebviewUI
}(TopCommonstyleBehavior);
TopWebviewUI.propConfigs = Object.assign({}, TopCommonstyleBehavior.propConfigs, {});
TopWebviewUI.defaultProps = Object.assign({}, TopCommonstyleBehavior.defaultProps, {
    tagName: 'top-webview'
});
TopUI.Widget.Webview = function() {
    Webview.prototype = Object.create(TopUI.Widget.prototype);
    Webview.prototype.constructor = Webview;
    function Webview(element, props) {
        if (element instanceof TopWebviewUI) {
            this.template = element
        } else {
            this.reactElement = React.createElement(TopWebviewUI, props)
        }
    }
    Webview.create = function(element, props) {
        return new Webview(element,props)
    }
    ;
    return Webview
}();
var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value'in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor)
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor
    }
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called')
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass)
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass
}
var TopWidgetitemUI = function(_TopWidgetBehavior) {
    _inherits(TopWidgetitemUI, _TopWidgetBehavior);
    function TopWidgetitemUI(props) {
        _classCallCheck(this, TopWidgetitemUI);
        return _possibleConstructorReturn(this, (TopWidgetitemUI.__proto__ || Object.getPrototypeOf(TopWidgetitemUI)).call(this, props))
    }
    _createClass(TopWidgetitemUI, [{
        key: 'render',
        value: function render() {
            console.log('render', this.props.id);
            return this.props.children
        }
    }]);
    return TopWidgetitemUI
}(TopWidgetBehavior);
TopWidgetitemUI.defaultProps = {
    tagName: 'top-widgetitem'
};
var TopRowitemUI = function(_TopWidgetitemUI) {
    _inherits(TopRowitemUI, _TopWidgetitemUI);
    function TopRowitemUI() {
        _classCallCheck(this, TopRowitemUI);
        return _possibleConstructorReturn(this, (TopRowitemUI.__proto__ || Object.getPrototypeOf(TopRowitemUI)).apply(this, arguments))
    }
    return TopRowitemUI
}(TopWidgetitemUI);
TopRowitemUI.defaultProps = {
    tagName: 'top-rowitem'
};
var TopColumnitemUI = function(_TopWidgetitemUI2) {
    _inherits(TopColumnitemUI, _TopWidgetitemUI2);
    function TopColumnitemUI() {
        _classCallCheck(this, TopColumnitemUI);
        return _possibleConstructorReturn(this, (TopColumnitemUI.__proto__ || Object.getPrototypeOf(TopColumnitemUI)).apply(this, arguments))
    }
    return TopColumnitemUI
}(TopWidgetitemUI);
TopColumnitemUI.defaultProps = {
    tagName: 'top-columnitem'
};
var TopTableheaderUI = function(_TopWidgetitemUI3) {
    _inherits(TopTableheaderUI, _TopWidgetitemUI3);
    function TopTableheaderUI() {
        _classCallCheck(this, TopTableheaderUI);
        return _possibleConstructorReturn(this, (TopTableheaderUI.__proto__ || Object.getPrototypeOf(TopTableheaderUI)).apply(this, arguments))
    }
    return TopTableheaderUI
}(TopWidgetitemUI);
TopTableheaderUI.defaultProps = {
    tagName: 'top-tableheader'
};
var TopHeaderrowUI = function(_TopWidgetitemUI4) {
    _inherits(TopHeaderrowUI, _TopWidgetitemUI4);
    function TopHeaderrowUI() {
        _classCallCheck(this, TopHeaderrowUI);
        return _possibleConstructorReturn(this, (TopHeaderrowUI.__proto__ || Object.getPrototypeOf(TopHeaderrowUI)).apply(this, arguments))
    }
    return TopHeaderrowUI
}(TopWidgetitemUI);
TopHeaderrowUI.defaultProps = {
    tagName: 'top-headerrow'
};
var TopHeadercolumnUI = function(_TopWidgetitemUI5) {
    _inherits(TopHeadercolumnUI, _TopWidgetitemUI5);
    function TopHeadercolumnUI() {
        _classCallCheck(this, TopHeadercolumnUI);
        return _possibleConstructorReturn(this, (TopHeadercolumnUI.__proto__ || Object.getPrototypeOf(TopHeadercolumnUI)).apply(this, arguments))
    }
    return TopHeadercolumnUI
}(TopWidgetitemUI);
TopHeadercolumnUI.defaultProps = {
    tagName: 'top-headercolumn'
};
var TopAccordiontabUI = function(_TopWidgetitemUI6) {
    _inherits(TopAccordiontabUI, _TopWidgetitemUI6);
    function TopAccordiontabUI() {
        _classCallCheck(this, TopAccordiontabUI);
        return _possibleConstructorReturn(this, (TopAccordiontabUI.__proto__ || Object.getPrototypeOf(TopAccordiontabUI)).apply(this, arguments))
    }
    return TopAccordiontabUI
}(TopWidgetitemUI);
TopAccordiontabUI.defaultProps = {
    tagName: 'top-accodiontab'
};
var top_index = 0;
TopUI.Render = function() {
    Render.prototype = Object.create(TopUI.prototype);
    Render.prototype.constructor = Render;
    Render.topWidgets = {
        'top-absolutelayout': TopAbsolutelayoutUI,
        'top-accordionlayout': TopAccordionlayoutUI,
        'top-accordiontab': TopAccordiontabUI,
        'top-alarmbadge': TopAlarmbadgeUI,
        'top-breadcrumb': TopBreadcrumbUI,
        'top-button': TopButtonUI,
        'top-chart': TopChartUI,
        'top-checkbox': TopCheckboxUI,
        'top-chip': TopChipUI,
        'top-codeeditor': TopCodeeditorUI,
        'top-colorpicker': TopColorpickerUI,
        'top-datepicker': TopDatepickerUI,
        'top-flowlayout': TopFlowlayoutUI,
        'top-framelayout': TopFramelayoutUI,
        'top-htmleditor': TopHtmleditorUI,
        'top-icon': TopIconUI,
        'top-imagebutton': TopImagebuttonUI,
        'top-imageslider': TopImagesliderUI,
        'top-imageview': TopImageviewUI,
        'top-layout': TopLayoutUI,
        'top-linearlayout': TopLinearlayoutUI,
        'top-listview': TopListviewUI,
        'top-menu': TopMenuUI,
        'top-pagination': TopPaginationUI,
        'top-progressbar': TopProgressbarUI,
        'top-radiobutton': TopRadiobuttonUI,
        'top-selectbox': TopSelectboxUI,
        'top-slider': TopSliderUI,
        'top-stepper': TopStepperUI,
        'top-spinner': TopSpinnerUI,
        'top-splitterlayout': TopSplitterlayoutUI,
        'top-switch': TopSwitchUI,
        'top-tablayout': TopTablayoutUI,
        'top-tableview': TopTableviewUI,
        'top-textarea': TopTextareaUI,
        'top-textfield': TopTextfieldUI,
        'top-textview': TopTextviewUI,
        'top-toggle': TopToggleUI,
        'top-treeview': TopTreeviewUI,
        'top-videoview': TopVideoviewUI,
        'top-webview': TopWebviewUI,
        'top-widgetitem': TopWidgetitemUI,
        'top-rowitem': TopRowitemUI,
        'top-columnitem': TopColumnitemUI,
        'top-tableheader': TopTableheaderUI,
        'top-headerrow': TopHeaderrowUI,
        'top-headercolumn': TopHeadercolumnUI
    };
    TopUI.Util.__initLibsPath();
    function Render() {}
    Render.renderDom = function(root, callback) {
        var _this = this;
        var navData = window.performance.getEntriesByType('navigation');
        TopUI.Util.__gatherPropertyAliases();
        TopUI.Util.__initVersion();
        if (navData.length > 0 && navData[0].loadEventEnd > 0) {
            ReactDOM.render(this.createNode(root), root);
            if (typeof callback === 'function')
                callback()
        } else {
            $(window).bind('load', function() {
                ReactDOM.render(_this.createNode(root), root);
                if (typeof callback === 'function')
                    callback()
            })
        }
    }
    ;
    Render.createNode = function(node) {
        var attrs = Array.prototype.slice.call(node.attributes);
        var props = {
            key: node.tagName + '-' + top_index
        };
        top_index++;
        attrs.map(function(attr) {
            return props[TopUI.Util.toCamelCase(attr.name)] = attr.value
        });
        if (!props.id) {
            props.id = TopUI.Util.guid()
        }
        if (!!props.class) {
            props.className = props.class;
            delete props.class
        }
        var children = [];
        for (var i = 0; i < node.children.length; i++) {
            var child = this.createNode(node.children[i]);
            children.push(child)
        }
        props.children = children;
        var Comp = TopUI.Render.topWidgets[node.tagName.toLowerCase()];
        if (!Comp)
            Comp = TopLayoutEditor;
        return React.createElement(Comp, props, children)
    }
    ;
    return Render
}();
