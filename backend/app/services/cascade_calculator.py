import math
import numpy as np

from app.utils.conversions import (
    db_to_linear,
    linear_to_db
)


def get_stage_gain_dB(stage):
    return stage.get("gain_dB", stage.get("gain_db", 0))


def get_stage_noise_figure_dB(stage):
    return stage.get("noise_figure_dB", stage.get("noise_figure_db", 0))


def get_stage_ip3_dBm(stage):
    return stage.get("ip3_dBm", stage.get("ip3_dbm"))

def calculate_total_gain(stages):
    """
    Calculate total cascaded gain in dB.
    """
    total_gain = 0

    for stage in stages:
        total_gain += get_stage_gain_dB(stage)

    return total_gain

def calculate_total_noise_figure(stages):
    """
    Calculate cascaded noise figure using Friss equation.
    """

    if len(stages) == 0:
        return 0
    
    # Convert first stage NF from dB to linear
    total_nf_linear = db_to_linear(get_stage_noise_figure_dB(stages[0]))

    cumulative_gain_linear = db_to_linear(get_stage_gain_dB(stages[0]))

    # Remaining stages
    for stage in stages[1:]:
        stage_nf_linear = db_to_linear(get_stage_noise_figure_dB(stage))

        total_nf_linear += (
            (stage_nf_linear - 1)
            / cumulative_gain_linear
        )

        cumulative_gain_linear *= db_to_linear(
            get_stage_gain_dB(stage)
        )

    return linear_to_db(total_nf_linear)

def analyze_receiver_chain(stages):
    """
    Main RF cascade analysis function.
    """

    total_gain = calculate_total_gain(stages)
    total_noise_figure = calculate_total_noise_figure(stages)
    input_ip3 = calculate_input_referred_ip3(stages)
    receiver_sensitivity = calculate_receiver_sensitivity(
        noise_figure_dB=total_noise_figure,
        bandwidth_hz=1_000_000,
        required_snr_dB=10,
    )
    spectrum_data = generate_fft_spectrum()
    qpsk_constellation = generate_qpsk_constellation()

    if input_ip3 is not None:
        output_ip3 = input_ip3 + total_gain
        dynamic_range_estimate = input_ip3 - total_noise_figure
    else:
        output_ip3 = None
        dynamic_range_estimate = None

    stage_analysis = calculate_stage_analysis(stages)

    return {
        "total_gain_dB": round(total_gain, 2),
        "total_noise_figure_dB": round(total_noise_figure, 2),
        "input_ip3_dBm": round(input_ip3, 2) if input_ip3 is not None else None,
        "output_ip3_dBm": round(output_ip3, 2) if output_ip3 is not None else None,
        "dynamic_range_estimate_dB": round(dynamic_range_estimate, 2) if dynamic_range_estimate is not None else None,
        "receiver_sensitivity_dBm": round(receiver_sensitivity, 2) if receiver_sensitivity is not None else None,
        "stage_analysis": stage_analysis,
        "spectrum_data": spectrum_data,
        "qpsk_constellation": qpsk_constellation,
    }

def calculate_input_referred_ip3(stages):
    """
    Estimate cascaded input-referred IP3 in dBm.
    """

    ip3_terms = []
    cumulative_gain_linear = 1

    for stage in stages:
        stage_ip3_dBm = get_stage_ip3_dBm(stage)
        if stage_ip3_dBm is None:
            continue
            
        stage_iip3_mW = 10 ** (stage_ip3_dBm / 10)

        ip3_terms.append(
            cumulative_gain_linear / stage_iip3_mW
        )

        cumulative_gain_linear *= db_to_linear(get_stage_gain_dB(stage))

    if len(ip3_terms) == 0:
        return None

    total_iip3_mW = 1 / sum(ip3_terms)

    return 10 * math.log10(total_iip3_mW)

def calculate_receiver_sensitivity(
    noise_figure_dB: float,
    bandwidth_hz: float = 1_000_000,
    required_snr_dB: float = 10,
):
    # define thermal noise density: -174 dBm/Hz
    thermal_noise_density_dBm_hz = -174

    # calculate bandwidth term using math.log10()
    bandwidth_dB = 10 * math.log10(bandwidth_hz)

    # calculate noise floor
    noise_floor_dBm = thermal_noise_density_dBm_hz + bandwidth_dB + noise_figure_dB

    # add required SNR
    sensitivity_dBm = noise_floor_dBm + required_snr_dB

    # return result
    return sensitivity_dBm

def calculate_stage_analysis(stages):

    # create empty list named stage_results
    stage_results = []

    # keep track of cumulative gain using variable cumulative_gain
    cumulative_gain_dB = 0

    # loop through each stage using variable stage
    for stage in stages:
        # add current stage gain to cumulative_gain
        cumulative_gain_dB += get_stage_gain_dB(stage)

        # create dictionary named stage_data
        stage_data = {
            "stage": stage["name"],
            "cumulative_gain_dB": round(cumulative_gain_dB, 2),
            "stage_noise_figure_dB": get_stage_noise_figure_dB(stage),
            "stage_ip3_dBm": get_stage_ip3_dBm(stage),
        }

        # append stage_data to stage_results
        stage_results.append(stage_data)

    # return stage_results
    return stage_results

    # create sampling frequency variable named sample_rate
    sample_rate = 1000

    # create signal frequency variable named signal_frequency
    signal_frequency = 50

    # create time array variable named time
    time = np.linspace(0, 1, sample_rate)

    # generate sine wave variable named signal
    signal = np.sin(2 * np.pi * signal_frequency* time)

    # compute FFT variable named fft_result
    fft_result = np.fft.fft(signal)

    # compute frequency bins variable named frequencies
    frequencies = np.fft.fftfreq(
        len(signal),
        1 / sample_rate
    )

    # compute magnitude variable named magnitude
    magnitude = np.abs(fft_result)

    # create empty list named spectrum_data
    spectrum_data = []

    # loop through FFT results
    for frequency, mag in zip(frequencies, magnitude):
        # create dictionary named spectrum_point
        spectrum_point ={
            "frequency_hz": frequency,
            "magnitude": mag
        }

        # append spectrum_point to spectrum_data ONLY IF frequency >= 0
        if frequency >= 0:
            spectrum_data.append(spectrum_point)

    # return spectrum_data
    return spectrum_data

def generate_fft_spectrum():

    # create sampling frequency variable named sample_rate
    sample_rate = 1000

    # create duration variable named duration_seconds
    duration_seconds = 1

    # create time array variable named time
    time = np.linspace(0, 1, sample_rate)

    # create first signal frequency variable named signal_frequency_1
    signal_frequency_1 = 50

    # create second signal frequency variable named signal_frequency_2
    signal_frequency_2 = 120

    # create noise strength variable named noise_amplitude
    noise_amplitude = 0.2

    # generate first sine wave variable named signal_1
    signal_1 = np.sin(2 * np.pi * signal_frequency_1 * time)

    # generate second sine wave variable named signal_2
    signal_2 = 0.5 * np.sin(2 * np.pi * signal_frequency_2 * time)

    # generate random noise variable named noise
    noise = noise_amplitude * np.random.randn(len(time))

    # combine signal_1, signal_2, and noise into variable named signal
    signal = signal_1 + signal_2 + noise

    # compute FFT variable named fft_result
    fft_result = np.fft.fft(signal)

    # compute frequency bins variable named frequencies
    frequencies = np.fft.fftfreq(len(signal), 1 / sample_rate)

    # compute magnitude variable named magnitude
    magnitude = np.abs(fft_result)

    # create empty list named spectrum_data
    spectrum_data = []

    # loop through FFT results using variables frequency and mag
    for frequency, mag in zip(frequencies, magnitude):

        # only keep positive frequencies
        if frequency < 0:
            continue
        # create dictionary named spectrum_point
        spectrum_point = {
            "frequency_hz": frequency,
            "magnitude": mag
        }

        # append spectrum_point to spectrum_data
        spectrum_data.append(spectrum_point)

    # return spectrum_data
    return spectrum_data

def generate_qpsk_constellation(noise_strength=0.15, points_per_symbol=25):

    # create empty list named constellation_points
    constellation_points = []

    # create list named qpsk_symbols
    qpsk_symbols = [
        # store the 4 QPSK symbol tuples
        (1, 1),    # Symbol 1: I=1, Q=1
        (1, -1),   # Symbol 2: I=1, Q=-1
        (-1, 1),   # Symbol 3: I=-1, Q=1
        (-1, -1)   # Symbol 4: I=-1, Q=-1
    ]

    # loop through each symbol using variables i_ideal and q_ideal
    for i_ideal, q_ideal in qpsk_symbols:
        # generate noisy I/Q samples around each ideal symbol
        noisy_i_values = np.random.normal(
            loc=i_ideal,
            scale=noise_strength,
            size=points_per_symbol,
        )
        noisy_q_values = np.random.normal(
            loc=q_ideal,
            scale=noise_strength,
            size=points_per_symbol,
        )

        # add noisy samples to constellation list
        for noisy_i, noisy_q in zip(noisy_i_values, noisy_q_values):
            point_data = {
                "i": float(noisy_i),
                "q": float(noisy_q)
            }
            constellation_points.append(point_data)

    # return noisy constellation_points
    return constellation_points