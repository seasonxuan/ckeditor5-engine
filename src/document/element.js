/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/node', 'document/nodelist' ], function( Node, NodeList ) {
	/**
	 * Tree data model element.
	 *
	 * @class document.Element
	 */
	class Element extends Node {
		/**
		 * Creates tree data model element.
		 *
		 * This constructor should be used only internally by the document.
		 *
		 * @param {String} name Node name.
		 * @param {Iterable} attrs Iterable collection of {@link document.Attribute attributes}.
		 * @param {document.Node|document.Text|document.NodeList|String|Iterable} children List of nodes to be inserted
		 * into created element. List of nodes can be of any type accepted by the {@link document.NodeList} constructor.
		 * @constructor
		 */
		constructor( name, attrs, children ) {
			super( attrs );

			/**
			 * Element name.
			 *
			 * @readonly
			 * @property {String} name
			 */
			this.name = name;

			/**
			 * List of children nodes.
			 *
			 * @protected
			 * @property {document.NodeList} _children
			 */
			this._children = new NodeList();

			if ( children ) {
				this.insertChildren( 0, children );
			}
		}

		/**
		 * Insert a list of child nodes on the given index and set the parent of these node to this.
		 *
		 * Note that list of children can be modified only in elements not attached yet to the document.
		 * All attached nodes should be modified using the {@link document.InsertOperation}.
		 *
		 * @param {Number} index Position where nodes should be inserted.
		 * @param {document.Node|document.Text|document.NodeList|String|Iterable} nodes List of nodes to be inserted.
		 * List of nodes can be of any type accepted by the {@link document.NodeList} constructor.
		 */
		insertChildren( index, nodes ) {
			this._children.insert( index, new NodeList( nodes ) );

			for ( var node of this._children ) {
				node.parent = this;
			}
		}

		/**
		 * Removes number of child nodes starting at the given index and set the parent of these node to null.
		 *
		 * Note that list of children can be modified only in elements not attached yet to the document.
		 * All attached nodes should be modified using the {@link document.RemoveOperation}.
		 *
		 * @param {Number} index Position of the first node to remove.
		 * @param {Number} number Number of nodes to remove.
		 * @returns {document.NodeList} List of removed nodes.
		 */

		removeChildren( index, number ) {
			for ( var i = index; i < index + number; i++ ) {
				this._children.get( i ).parent = null;
			}

			return this._children.remove( index, number );
		}

		/**
		 * Gets child at given index.
		 *
		 * @param {Number} index Index of child.
		 * @returns {document.Node} Child node.
		 */
		getChild( index ) {
			return this._children.get( index );
		}

		/**
		 * Gets index of child node.
		 *
		 * @param {document.Node} node Child node.
		 * @returns {Number} Index of child.
		 */
		getChildIndex( node ) {
			return this._children.indexOf( node );
		}

		/**
		 * Gets number of element's children.
		 *
		 * @returns {Number} Number of element's children.
		 */
		getChildCount() {
			return this._children.length;
		}
	}

	return Element;
} );
