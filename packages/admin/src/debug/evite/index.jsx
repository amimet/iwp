import React from "react"
import ReactJson from "react-json-view"

export default () => {
	return (
		<div>
			<div>
				<h4>namespace</h4>
				<ReactJson name="window.__evite" collapsed="true" src={window.__evite} />
			</div>
            <div>
                <h4>extensions</h4>
                
            </div>
		</div>
	)
}
