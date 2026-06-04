def classify_signal_quality(link_margin_db):

    # if link_margin_db >= 20
    if link_margin_db >= 20:
        # return "Good"
        return "Good"

    # elif link_margin_db >= 5
    elif link_margin_db >= 5:
        # return "Fair"
        return "Fair"

    # else
    else:
        # return "Poor"
        return "Poor"