/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * TextProxy is a wrapper for substring of {@link engine.view.Text}. Instance of this class is created by
 * {@link engine.view.TreeWalker} when only a part of {@link engine.view.Text} needs to be returned.
 *
 * `TextProxy` has an API similar to {@link engine.view.Text Text} and allows to do most of the common tasks performed
 * on view nodes.
 *
 * **Note:** Some `TextProxy` instances may represent whole text node, not just a part of it.
 * See {@link engine.view.TextProxy#isPartial}.
 *
 * **Note:** `TextProxy` is a readonly interface.
 *
 * **Note:** `TextProxy` instances are created on the fly basing on the current state of parent {@link engine.view.Text}.
 * Because of this it is highly unrecommended to store references to `TextProxy instances because they might get
 * invalidated due to operations on Document. Also TextProxy is not a {@link engine.view.Node} so it can not be
 * inserted as a child of {@link engine.view.Element}.
 *
 * `TextProxy` supports unicode. See {@link engine.model.Text} for more information.
 *
 * `TextProxy` instances are created by {@link engine.view.TreeWalker view tree walker}. You should not need to create
 * an instance of this class by your own.
 *
 * @memberOf engine.view
 */
export default class TextProxy {
	/**
	 * Creates a text proxy.
	 *
	 * @protected
	 * @param {engine.view.Text} textNode Text node which part is represented by this text proxy.
	 * @param {Number} offsetInText Offset in {@link engine.view.TextProxy#textNode text node} from which the text proxy starts.
	 * @param {Number} length Text proxy length, that is how many text node's characters, starting from `offsetInText` it represents.
	 * @constructor
	 */
	constructor( textNode, offsetInText, length ) {
		/**
		 * Reference to the {@link engine.view.Text} element which TextProxy is a substring.
		 *
		 * @readonly
		 * @member {engine.view.Text} engine.view.TextProxy#textNode
		 */
		this.textNode = textNode;

		if ( offsetInText < 0 || offsetInText > textNode.size ) {
			/**
			 * Given offsetInText value is incorrect.
			 *
			 * @error view-textproxy-wrong-offsetintext
			 */
			throw new CKEditorError( 'view-textproxy-wrong-offsetintext: Given offsetInText value is incorrect.' );
		}

		if ( length < 0 || offsetInText + length > textNode.size ) {
			/**
			 * Given length value is incorrect.
			 *
			 * @error view-textproxy-wrong-length
			 */
			throw new CKEditorError( 'view-textproxy-wrong-length: Given length value is incorrect.' );
		}

		/**
		 * Size of this text proxy. Equal to the number of symbols represented by the text proxy.
		 *
		 * @readonly
		 * @member {Number} engine.view.TextProxy#size
		 */
		this.size = length;

		/**
		 * Offset in the `textNode` where this `TextProxy` instance starts.
		 *
		 * @readonly
		 * @member {Number} engine.view.TextProxy#offsetInText
		 */
		this.offsetInText = offsetInText;

		/**
		 * Text data represented by this text proxy.
		 *
		 * @readonly
		 * @member {String} engine.view.TextProxy#data
		 */
		this.data = this.textNode.getSymbols( this.offsetInText, this.size );
	}

	/**
	 * Flag indicating whether `TextProxy` instance covers only part of the original {@link engine.view.Text text node}
	 * (`true`) or the whole text node (`false`).
	 *
	 * This is `false` when text proxy starts at the very beginning of {@link engine.view.TextProxy#textNode textNode}
	 * ({@link engine.view.TextProxy#offsetInText offsetInText} equals `0`) and text proxy sizes is equal to
	 * text node size.
	 *
	 * @readonly
	 * @type {Boolean}
	 */
	get isPartial() {
		return this.size !== this.textNode.size;
	}

	/**
	 * Parent of this text proxy, which is same as parent of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {engine.view.Element|engine.view.DocumentFragment|null}
	 */
	get parent() {
		return this.textNode.parent;
	}

	/**
	 * Root of this text proxy, which is same as root of text node represented by this text proxy.
	 *
	 * @readonly
	 * @type {engine.view.Node|engine.view.DocumentFragment}
	 */
	get root() {
		return this.textNode.root;
	}

	/**
	 * {@link engine.view.Document View document} that owns this text proxy, or `null` if the text proxy is inside
	 * {@link engine.view.DocumentFragment document fragment}.
	 *
	 * @readonly
	 * @type {engine.view.Document|null}
	 */
	get document() {
		return this.textNode.document;
	}

	/**
	 * Returns ancestors array of this text proxy.
	 *
	 * @param {Object} options Options object.
	 * @param {Boolean} [options.includeNode=false] When set to `true` {#textNode} will be also included in parent's array.
	 * @param {Boolean} [options.parentFirst=false] When set to `true`, array will be sorted from text proxy parent to
	 * root element, otherwise root element will be the first item in the array.
	 * @returns {Array} Array with ancestors.
	 */
	getAncestors( options = { includeNode: false, parentFirst: false } ) {
		const ancestors = [];
		let parent = options.includeNode ? this.textNode : this.parent;

		while ( parent !== null ) {
			ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
			parent = parent.parent;
		}

		return ancestors;
	}
}