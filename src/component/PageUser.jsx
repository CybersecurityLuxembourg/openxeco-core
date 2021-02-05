import React from 'react';
import './PageUser.css';
import UserUser from  './pageuser/UserUser';
import UserGroup from './pageuser/UserGroup';
import Tab from './tab/Tab';


export default class PageUser extends React.Component {

	constructor(props){
		super(props);


		this.state = {}
	}

	render() {
		return (
			<div id="PageUser" className="page max-sized-page">
				<Tab
					menu={["User", "Group"]}
					content={[<UserUser/>, <UserGroup/>]}
				/>
			</div>
		);
	}
}