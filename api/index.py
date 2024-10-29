from flask import Flask, render_template, jsonify, request
import math

app = Flask(__name__)
app.secret_key = "heating_simulator_key"


def calculate_environmental_impact(heating_method, room_area, efficiency):
    # CO2 emissions per kWh for different energy sources (kg CO2/kWh)
    emissions_factors = {
        'fireplace': 0.39,  # Wood
        'hypocaust': 0.45,  # Wood/coal mix
        'ondol': 0.42,  # Wood/coal mix
        'pech': 0.39,  # Wood
        'kang': 0.82,  # Coal
        'brazier': 0.39,  # Wood/charcoal
        'radiator': 0.23,  # Electricity (mixed grid)
        'underfloor': 0.18  # Natural gas
    }

    # Renewable percentage for each method
    renewable_percentage = {
        'fireplace': 80,  # Wood is mostly renewable
        'hypocaust': 50,  # Mix of wood and coal
        'ondol': 50,  # Mix of wood and coal
        'pech': 80,  # Wood
        'kang': 0,  # Coal
        'brazier': 70,  # Wood/charcoal mix
        'radiator': 40,  # Depends on grid mix
        'underfloor': 20  # Some biogas potential
    }

    # Calculate energy consumption (kWh per month)
    power_needed = 0.1 * room_area  # kW per square meter
    monthly_energy = power_needed * 8 * 30  # 8 hours per day, 30 days

    # Adjust based on efficiency
    actual_energy = monthly_energy * (100 / efficiency)

    # Calculate monthly emissions
    monthly_emissions = actual_energy * emissions_factors[heating_method]

    return {
        'monthly_emissions': round(monthly_emissions, 2),
        'renewable_percentage': renewable_percentage[heating_method],
        'emissions_per_kwh': emissions_factors[heating_method]
    }


def calculate_heating_costs(heating_method, room_area, efficiency):
    # Cost per kWh in dollars for different energy sources
    energy_costs = {
        'fireplace': 0.15,  # Wood
        'hypocaust': 0.20,  # Wood/coal
        'ondol': 0.18,  # Wood/coal
        'pech': 0.16,  # Wood
        'kang': 0.17,  # Coal
        'brazier': 0.19,  # Charcoal
        'radiator': 0.25,  # Electricity
        'underfloor': 0.22  # Natural gas
    }

    # Estimated power needed per square meter (kW)
    power_needed = 0.1 * room_area

    # Calculate daily usage (8 hours average)
    daily_usage = power_needed * 8

    # Calculate monthly cost
    monthly_cost = daily_usage * 30 * energy_costs[heating_method]

    # Adjust cost based on efficiency
    adjusted_monthly_cost = monthly_cost * (100 / efficiency)

    # Installation costs
    installation_costs = {
        'fireplace': 2000,
        'hypocaust': 5000,
        'ondol': 4000,
        'pech': 3500,
        'kang': 3000,
        'brazier': 200,
        'radiator': 1500,
        'underfloor': 6000
    }

    return {
        'monthly_cost': round(adjusted_monthly_cost, 2),
        'installation_cost': installation_costs[heating_method],
        'energy_rate': energy_costs[heating_method]
    }


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        room_size = data.get('roomSize')
        insulation = data.get('insulation')
        heating_method = data.get('heatingMethod')

        if not all([room_size, insulation, heating_method]):
            return jsonify({'error': 'Missing required parameters'}), 400

        # Base efficiency values for each heating method
        efficiencies = {
            'fireplace': {
                'efficiency': 0.30,
                'type': 'ancient'
            },
            'hypocaust': {
                'efficiency': 0.45,
                'type': 'ancient'
            },
            'ondol': {
                'efficiency': 0.50,
                'type': 'ancient'
            },
            'pech': {
                'efficiency': 0.65,
                'type': 'ancient'
            },
            'kang': {
                'efficiency': 0.40,
                'type': 'ancient'
            },
            'brazier': {
                'efficiency': 0.25,
                'type': 'ancient'
            },
            'radiator': {
                'efficiency': 0.85,
                'type': 'modern'
            },
            'underfloor': {
                'efficiency': 0.95,
                'type': 'modern'
            }
        }

        # Insulation factors
        insulation_factors = {'none': 0.5, 'basic': 0.7, 'modern': 0.9}

        if heating_method not in efficiencies:
            return jsonify(
                {'error': f"Invalid heating method: {heating_method}"}), 400

        if insulation not in insulation_factors:
            return jsonify({'error':
                            f"Invalid insulation type: {insulation}"}), 400

        base_efficiency = efficiencies[heating_method]['efficiency']
        insulation_factor = insulation_factors[insulation]

        # Calculate heat distribution
        room_area = room_size['width'] * room_size['length']
        heat_output = base_efficiency * insulation_factor * room_area
        efficiency_percentage = base_efficiency * 100

        result = {
            'efficiency': efficiency_percentage,
            'heat_output': heat_output,
            'heat_loss': (1 - base_efficiency * insulation_factor) * room_area,
            'heating_type': efficiencies[heating_method]['type']
        }

        # Add cost calculations
        costs = calculate_heating_costs(heating_method, room_area,
                                        efficiency_percentage)
        result.update(costs)

        # Add environmental impact calculations
        environmental = calculate_environmental_impact(heating_method,
                                                       room_area,
                                                       efficiency_percentage)
        result.update(environmental)

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
