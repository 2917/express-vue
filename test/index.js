import assert     from 'assert';
import expressVue from '../lib';
import {Defaults, Types} from '../lib/defaults';
import {
    renderUtil,
    layoutUtil,
    renderHtmlUtil,
    scriptToString,
    metaUtil
} from '../lib/utils';
import {
    componentParser,
    layoutParser
} from '../lib/parser';

describe('express-vue', function () {
    it('Express Vue loads', function () {
        const isAFunction = typeof expressVue === 'function';

        assert(isAFunction, 'Loads and is a function');
    });

    it('should have a defaults class', function() {
        const object  = {
            componentsDir: '/baz',
            defaultLayout: 'qux'
        };
        const viewsPath = '/foo/bar';
        const defaultObject = new Defaults(object, viewsPath);

        //Booleans
        const componentsDir = defaultObject.componentsDir === '/baz/';
        const rootPath      = defaultObject.rootPath      === '/foo/bar/';
        const backupLayout  = defaultObject.backupLayout  === '<template><!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><script src="https://unpkg.com/vue/dist/vue.js"></script></head><body>{{{app}}}{{{script}}}<script>app.$mount("#app")</script></body></html></template><script></script><style></style>';
        const defaultLayout = defaultObject.defaultLayout === '/foo/bar/qux';


        assert(componentsDir, 'Components Directory is Present');
        assert(rootPath, 'Root Path is correct');
        assert(backupLayout, 'Backup layout is present');
        assert(defaultLayout, 'default layout is constructing correctly');
    });

    it('it should turn objects to strings' , function() {
        const object = {
            'string': 'foo',
            'function': function() {
                return 'baz';
            },
            'array': ['one', 'two', 'three'],
            'object': {
                dog: true,
                cat: false
            },
            'number': 42,
            'boolean': true
        }

        const string = scriptToString(object);

        //Booleans
        const hasString   = string.includes(`string: "foo"`);
        const hasNumber   = string.includes(`number: 42`);
        const hasArray    = string.includes(`array: ["one","two","three"]`);
        const hasObject   = string.includes(`object: {dog: true,cat: false,}`);
        const hasBoolean  = string.includes(`boolean: true`);
        const hasFunction = string.includes(`function: function _function() {
                return 'baz';
            }`);
        const hasFinal    = string === `{string: "foo",function: function _function() {
                return 'baz';
            },array: ["one","two","three"],object: {dog: true,cat: false,},number: 42,boolean: true,}`;

        assert(hasString, 'Has a String');
        assert(hasNumber, 'Has a Number');
        assert(hasArray, 'Has a Array');
        assert(hasObject, 'Has a Object');
        assert(hasBoolean, 'Has a Boolean');
        assert(hasFunction, 'Has a Function');
        assert(hasFinal, 'Is a fully formed string')
    });

    it('it should do head', function() {
        const object = {
                title: 'It was a Pleasure',
                head: [
                    { name: 'application-name', content: 'Name of my application' },
                    { name: 'description', content: 'A description of the page', id: 'desc' },
                    { name: 'twitter:title', content: 'Content Title' },
                    { property: 'fb:app_id', content: '123456789' },
                    { property: 'og:title', content: 'Content Title' },
                    { script: '/assets/scripts/hammer.min.js' },
                    { script: '/assets/scripts/vue-touch.min.js', charset: 'utf-8' },
                    { style: '/assets/rendered/style.css' },
                    { style: '/assets/rendered/style.css', type: 'text/css' },
                    { style: '/assets/rendered/style.css', type: 'text/css', rel: 'stylesheet' }
                ]
            };

        const metaString = metaUtil(object);

        //Booleans
        const stringIsCorrect = metaString === '<title>It was a Pleasure</title><meta name="application-name" content="Name of my application" /><meta name="description" content="A description of the page" /><meta name="twitter:title" content="Content Title" /><meta property="fb:app_id" content="123456789" /><meta property="og:title" content="Content Title" /><script src="/assets/scripts/hammer.min.js" charset="utf-8"></script><script src="/assets/scripts/vue-touch.min.js" charset="utf-8"></script><link rel="stylesheet" type="text/css" href="/assets/rendered/style.css"><link rel="stylesheet" type="text/css" href="/assets/rendered/style.css"><link rel="stylesheet" type="text/css" href="/assets/rendered/style.css"></head>'
        const hasTitle        = metaString.includes('<title>It was a Pleasure</title>');
        const hasMetaName     = metaString.includes(`<meta name="application-name" content="Name of my application" />`);
        const hasMetaProperty = metaString.includes(`<meta property="og:title" content="Content Title" />`);
        const hasScript       = metaString.includes(`<script src="/assets/scripts/hammer.min.js" charset="utf-8">`)
        const hasStyle        = metaString.includes(`<link rel="stylesheet" type="text/css" href="/assets/rendered/style.css">`)

        assert(stringIsCorrect, 'String is correct');
        assert(hasTitle, 'has title section');
        assert(hasMetaName, 'has meta name section');
        assert(hasMetaProperty, 'has meta property section');
        assert(hasScript, 'has scripts');
        assert(hasStyle, 'has style 🎷');
    });


    it('it should parse components', function() {
        let types    = new Types();
        const component = __dirname + '/component.vue';
        const object  = {
            componentsDir:  __dirname + ''
        };
        const viewsPath = '/foo/bar';
        const defaultObject = new Defaults(object, viewsPath);
        const componentArray = [
            layoutParser('', defaultObject, types.LAYOUT),
            componentParser(component, defaultObject, types.COMPONENT)
        ];
        Promise.all(componentArray).then(function(components) {
            renderHtmlUtil(components, defaultObject).then(function(html) {
                assert(true, 'it cant parse components');
            }).catch(function(error) {
                assert(false, 'it cant parse components' + error);
            });
        }, function(error) {
            assert(false, 'it cant parse components' + error);
        });

    });
});
