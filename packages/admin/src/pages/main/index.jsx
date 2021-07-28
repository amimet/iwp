import React from "react"

export default class MainTest extends React.Component {
	setCartState = (payload) => {
		const [state, dispatch] = this.props.withGlobalState()
		dispatch({ type: "UPDATE_CART", payload })
	}

	sumItems = () => {
		const [state, dispatch] = this.props.withGlobalState()
		dispatch({ type: "UPDATE_CART", payload: {
			items: (state.cart?.items ?? 0) + 1
		}})
	}

	render() {
		const [ state, dispatch ] = this.props.withGlobalState()
		return <div>
			STATE:

			<div>
			{JSON.stringify(state)}
			</div>

			<div>
				<button onClick={() => this.setCartState({ mayonese: 30 })}>
					set cart
				</button>
				<button onClick={() => this.sumItems()}>
					sum
				</button>
			</div>
		</div>
	}
}