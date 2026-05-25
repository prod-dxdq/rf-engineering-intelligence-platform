import numpy as np


def generate_fft_spectrum():
    # create sampling frequency variable named sample_rate
    sample_rate = 1000

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

        spectrum_data.append({
            "frequency_hz": float(frequency),
            "magnitude": float(mag),
        })

    return spectrum_data


def generate_qpsk_constellation(noise_strength=0.15, points_per_symbol=25):
    # create empty list named constellation_points
    constellation_points = []

    # create list named qpsk_symbols
    qpsk_symbols = [
        (1, 1),
        (1, -1),
        (-1, 1),
        (-1, -1),
    ]

    # loop through each symbol using variables i_ideal and q_ideal
    for i_ideal, q_ideal in qpsk_symbols:
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

        for noisy_i, noisy_q in zip(noisy_i_values, noisy_q_values):
            constellation_points.append({
                "i": float(noisy_i),
                "q": float(noisy_q),
            })

    return constellation_points


def analyze_wireless_dsp():
    return {
        "spectrum_data": generate_fft_spectrum(),
        "qpsk_constellation": generate_qpsk_constellation(),
    }
