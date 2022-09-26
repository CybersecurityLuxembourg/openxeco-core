import { Component } from "react";
import "./Item.css";

export default class Item extends Component {
	constructor() {
		super();

		if (this.constructor === Item) {
			throw new Error("Abstract classes can't be instantiated.");
		}
	}
}
