import React from 'react';
import './Filter.css'

export default class Filter extends React.Component {

    render() {
        return (
            <div className="Filter">
                <i className="Filter-logo fas fa-filter"/>
                <div className="Filter-content">
                	{this.props.content}
                </div>
                <i className="Filter-delete fas fa-times"
                	onClick={() => this.props.onDelete()}
                />
            </div>
        )
    }
}