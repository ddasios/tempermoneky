(function() {
    'use strict';

    console.log('Tamper script running on:', window.location.href);

    if (window.location.hostname === 'steiledema.boxnow.gr') {
        const params = new URLSearchParams(window.location.search);

        const locker = params.get('locker');

        if (locker) {
            GM_setValue('boxnow_locker', locker);
            console.log('Saved locker:', locker);
        }
    }

    function setInput(name, value) {
        if (!value) return;

        const input = document.querySelector(`[name="${name}"]`);

        if (!input) {
            console.log('Not found:', name);
            return;
        }

        const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
        ).set;

        setter.call(input, value);

        input.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            inputType: 'insertText',
            data: value
        }));

        input.dispatchEvent(new Event('change', {
            bubbles: true
        }));

        //console.log('Filled:', name, value);
    }


    function waitAndFill() {
        const params = new URLSearchParams(window.location.search);

        // https://steiledema.boxnow.gr/apostoli-dematos?name=Dennis%20Dasios&email=ddasios@gmail.com&phone=6938386367&sender_name=DIRTY NOISE&sender_id=AK617339&sender_email=info@dirtynoise.gr&sender_phone=6940262673&sender_vat=075513870&price=50&sender_address=Διδότου 49&sender_zip=10680&sender_city=Αθήνα&locker=BOX NOW STORE - Νέος Κόσμος 3 - Θεοδώρητου Βρεσθένης 53, 11743, Αθήνα
        setInput('senderName', params.get('sender_name'));
        setInput('senderIdentificationNumber', params.get('sender_id'));
        setInput('senderEmail', params.get('sender_email'));
        setInput('senderPhoneNumber', params.get('sender_phone'));

        // open VAT field
        clickVATCheckbox();

        // wait for VAT input to appear
        const vatTimer = setInterval(() => {
            if (document.querySelector('[name="senderVAT"]')) {
                clearInterval(vatTimer);
                setInput('senderVAT', params.get('sender_vat'));
            }
        }, 500);

        if (params.get('price')) {
            selectTechnicalNote(params.get('price'));
        }

        setFieldById('free-solo-2-demo', params.get('sender_address'));
        setFieldById('mui-5', params.get('sender_zip'));
        setFieldById('mui-6', params.get('sender_city'));

        setInput('recipientName', params.get('name'));
        setInput('recipientEmail', params.get('email'));
        setInput('recipientPhoneNumber', params.get('phone'));

        selectSize('1');
        checkBox('acceptTerms');
        checkBox('acceptTermsShip');
    }


    const timer = setInterval(() => {
        if (document.querySelector('[name="recipientName"]')) {
            clearInterval(timer);
            waitAndFill();
        }
    }, 500);

    function clickVATCheckbox() {
        const labels = [...document.querySelectorAll('.checkboxcolumn')];

        const vatRow = labels.find(el =>
                                   el.innerText.includes('Α.Φ.Μ')
                                  );

        if (!vatRow) {
            console.log('VAT checkbox row not found');
            return;
        }

        const checkbox = vatRow.querySelector('input[type="checkbox"]');

        if (checkbox && !checkbox.checked) {
            checkbox.click();
        }
    }

    function selectTechnicalNote(value) {
        const input = document.querySelector('[name="technicalNote"]');

        if (!input) {
            console.log('technicalNote input NOT FOUND');
            return;
        }

        const container = input.closest('.MuiOutlinedInput-root');

        if (!container) {
            console.log('container NOT FOUND');
            return;
        }

        const selectButton = container.querySelector('.MuiSelect-select');

        if (!selectButton) {
            console.log('select button NOT FOUND');
            return;
        }

        selectButton.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true
        }));

        selectButton.dispatchEvent(new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true
        }));

        selectButton.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true
        }));

        const timer = setInterval(() => {
            const options = document.querySelectorAll('.MuiMenuItem-root');

            const option = document.querySelector(
                `.MuiMenuItem-root[data-value="${value}"]`
            );

            if (option) {
                clearInterval(timer);
                option.click();
            }

        }, 500);

        setTimeout(() => {
            clearInterval(timer);
            console.log('stopped waiting for options');
        }, 10000);
    }

    function setFieldById(id, value) {
        if (!value) return;

        const input = document.querySelector(`#${id}`);

        if (!input) {
            console.log('Not found:', id);
            return;
        }

        const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            'value'
        ).set;

        setter.call(input, value);

        input.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            inputType: 'insertText',
            data: value
        }));

        input.dispatchEvent(new Event('change', {
            bubbles: true
        }));

        //console.log('Filled:', id, value);
    }

    function checkBox(name) {
        const checkbox = document.querySelector(`input[name="${name}"]`);

        if (!checkbox) {
            console.log('Checkbox not found:', name);
            return;
        }

        if (!checkbox.checked) {
            checkbox.click();
            //console.log('Checked:', name);
        }
    }

    const iframeTimer = setInterval(() => {
        let boxInput = document.querySelector('#boxnow_widget_input');

        if (boxInput) {
            clearInterval(iframeTimer);
            console.log('Found boxnow input:', boxInput);
            const setter = Object.getOwnPropertyDescriptor(
                HTMLInputElement.prototype,
                'value'
            ).set;

            const locker = GM_getValue('boxnow_locker');

            if (!locker) {
                console.log('No locker parameter');
                return;
            }

            setter.call(boxInput, locker);

            boxInput.focus();

            boxInput.dispatchEvent(new Event('input', {
                bubbles: true
            }));

            boxInput.dispatchEvent(new KeyboardEvent('keyup', {
                bubbles: true,
                key: 'Enter'
            }));

            console.log('Filled search:', locker);


            // wait for search results and click first option
            const optionTimer = setInterval(() => {
                const options = document.querySelectorAll('#boxnow_suggest li');

                if (options.length > 0) {
                    clearInterval(optionTimer);

                    console.log('Clicking suggestion:', options[0]);

                    options[0].click();

                    const lockerListTimer = setInterval(() => {
                        const lockers = document.querySelectorAll('.boxnow_btn_select_locker');

                        if (lockers.length > 0) {
                            clearInterval(lockerListTimer);
                            lockers[0].click();
                        }

                    }, 500);


                    setTimeout(() => {
                        clearInterval(lockerListTimer);
                        console.log('Stopped waiting for locker list');
                    }, 10000);
                }

            }, 500);


            setTimeout(() => {
                clearInterval(optionTimer);
                console.log('Stopped waiting for locker options');
            }, 10000);
        }
    }, 500);

    function selectSize(value) {
        const radio = document.querySelector(`input[name="size"][value="${value}"]`);

        if (!radio) {
            console.log('Size radio not found:', value);
            return;
        }

        const label = radio.closest('label');

        if (label) {
            label.click();
            console.log('Selected size:', value);
        }
    }

})();
